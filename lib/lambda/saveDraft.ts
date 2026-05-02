import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import {
  getDraftPackage,
  getPackage,
  isActiveDraftPackage,
  isActiveMainNonDraftPackage,
  isDeletedDraftPackage,
} from "libs/api/package";
import { response } from "libs/handler-lib";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { getStatus, SEATOOL_STATUS } from "shared-types";
import { isStateUser } from "shared-utils";
import { z } from "zod";

import { authenticatedMiddy, ContextWithAuthenticatedUser } from "./middleware";
import { getUserByEmail } from "./user-management/userManagementService";

const draftableEvents = [
  "new-medicaid-submission",
  "new-chip-submission",
  "new-chip-details-submission",
  "capitated-initial",
  "capitated-renewal",
  "capitated-amendment",
  "contracting-initial",
  "contracting-renewal",
  "contracting-amendment",
  "temporary-extension",
  "app-k",
] as const;

type DraftableEvent = (typeof draftableEvents)[number];

const eventToAuthority: Partial<Record<DraftableEvent, string>> = {
  "new-medicaid-submission": "Medicaid SPA",
  "new-chip-submission": "CHIP SPA",
  "new-chip-details-submission": "CHIP SPA",
  "capitated-initial": "1915(b)",
  "capitated-renewal": "1915(b)",
  "capitated-amendment": "1915(b)",
  "contracting-initial": "1915(b)",
  "contracting-renewal": "1915(b)",
  "contracting-amendment": "1915(b)",
  "app-k": "1915(c)",
};

const eventToActionType: Partial<Record<DraftableEvent, string>> = {
  "capitated-initial": "New",
  "capitated-renewal": "Renew",
  "capitated-amendment": "Amend",
  "contracting-initial": "New",
  "contracting-renewal": "Renew",
  "contracting-amendment": "Amend",
  "temporary-extension": "Extend",
  "app-k": "Amend",
};

const saveDraftEventSchema = z
  .object({
    body: z
      .object({
        id: z.string().trim().min(1),
        originalDraftId: z.string().trim().min(1).optional(),
        event: z.string(),
        authority: z.string().optional(),
        draftData: z.record(z.unknown()),
        ifSeqNo: z.number().int().nonnegative().optional(),
        ifPrimaryTerm: z.number().int().nonnegative().optional(),
      })
      .strict(),
  })
  .passthrough();

export type SaveDraftEvent = APIGatewayEvent & z.infer<typeof saveDraftEventSchema>;

const DRAFT_ID_CONFLICT_MESSAGE =
  "This package ID is already in use. Update the ID before saving or submitting.";

const DRAFT_CONCURRENCY_MESSAGE =
  "Draft was updated by another user. Refresh this page and try saving again.";

const resolveAuthority = (
  eventName: DraftableEvent,
  authority: string | undefined,
  draftData: Record<string, unknown>,
) => {
  const normalizedAuthority = authority?.trim();
  if (normalizedAuthority) return normalizedAuthority;

  if (typeof draftData.authority === "string" && draftData.authority.trim()) {
    return draftData.authority.trim();
  }

  const nestedAuthority = (draftData as any)?.ids?.validAuthority?.authority;
  if (typeof nestedAuthority === "string" && nestedAuthority.trim()) {
    return nestedAuthority.trim();
  }

  return eventToAuthority[eventName];
};

const isVersionConflictError = (error: unknown) => {
  if (error && typeof error === "object") {
    const osType = (error as { meta?: { body?: { error?: { type?: string } } } }).meta?.body?.error
      ?.type;
    if (osType === "version_conflict_engine_exception") {
      return true;
    }
  }

  if (error instanceof Error) {
    return error.message.includes("version_conflict_engine_exception");
  }

  return false;
};

const isDraftIdConflictError = (error: unknown) => {
  if (error && typeof error === "object") {
    const osError = (error as { meta?: { body?: { error?: unknown } } }).meta?.body?.error;
    if (JSON.stringify(osError).includes("draft_id_conflict")) {
      return true;
    }
  }

  if (error instanceof Error) {
    return error.message.includes("draft_id_conflict");
  }

  return false;
};

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: saveDraftEventSchema,
}).handler(async (event: SaveDraftEvent, context: ContextWithAuthenticatedUser) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  const {
    id,
    originalDraftId,
    event: eventName,
    authority,
    draftData,
    ifSeqNo,
    ifPrimaryTerm,
  } = event.body;
  if (!draftableEvents.includes(eventName as DraftableEvent)) {
    return response({
      statusCode: 400,
      body: { message: `Drafts are not supported for event ${eventName}` },
    });
  }

  const normalizedId = id.toUpperCase();
  const normalizedOriginalDraftId = originalDraftId?.toUpperCase();
  const stateCode = normalizedId.slice(0, 2);

  if (!context.authenticatedUser || !isStateUser(context.authenticatedUser)) {
    return response({
      statusCode: 403,
      body: { message: "Only state users can save drafts." },
    });
  }

  const userStates = context.authenticatedUser.states?.map((state) => state.toUpperCase()) || [];
  if (!userStates.includes(stateCode)) {
    return response({
      statusCode: 403,
      body: { message: "Not authorized to view this resource" },
    });
  }

  if (normalizedOriginalDraftId && !userStates.includes(normalizedOriginalDraftId.slice(0, 2))) {
    return response({
      statusCode: 403,
      body: { message: "Not authorized to view this resource" },
    });
  }

  const existingMainPackage = await getPackage(normalizedId);
  const existingDraftPackage = await getDraftPackage(normalizedId);
  const sourceDraftPackage =
    normalizedOriginalDraftId && normalizedOriginalDraftId !== normalizedId
      ? await getDraftPackage(normalizedOriginalDraftId)
      : existingDraftPackage;

  if (isActiveMainNonDraftPackage(existingMainPackage)) {
    return response({
      statusCode: 409,
      body: { message: DRAFT_ID_CONFLICT_MESSAGE },
    });
  }

  if (normalizedOriginalDraftId && !isActiveDraftPackage(sourceDraftPackage)) {
    return response({
      statusCode: 404,
      body: { message: "No record found for the given id" },
    });
  }

  const sourceDraftState = sourceDraftPackage?._source?.state?.toUpperCase();
  if (
    normalizedOriginalDraftId &&
    normalizedOriginalDraftId !== normalizedId &&
    sourceDraftState &&
    !userStates.includes(sourceDraftState)
  ) {
    return response({
      statusCode: 403,
      body: { message: "Not authorized to view this resource" },
    });
  }

  const isSavingExistingDraftAtSameId =
    normalizedOriginalDraftId !== undefined && normalizedOriginalDraftId === normalizedId;
  const hasActiveDraftAtTarget = isActiveDraftPackage(existingDraftPackage);

  if (hasActiveDraftAtTarget && !isSavingExistingDraftAtSameId) {
    return response({
      statusCode: 409,
      body: { message: DRAFT_ID_CONFLICT_MESSAGE },
    });
  }

  const authDetails = getAuthDetails(event);
  const userAttr = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  const user = await getUserByEmail(userAttr.email);

  if (!user) {
    return response({
      statusCode: 400,
      body: { message: "User does not exist in User OpenSearch Index" },
    });
  }

  const savedAt = new Date().toISOString();
  const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.DRAFT);
  const draftEventName = eventName as DraftableEvent;
  const resolvedAuthority = resolveAuthority(draftEventName, authority, draftData);

  if (!resolvedAuthority) {
    return response({
      statusCode: 400,
      body: {
        message:
          draftEventName === "temporary-extension"
            ? "Please select a Temporary Extension Type before saving."
            : "Authority is required before saving.",
      },
    });
  }

  const hasActiveSourceDraft = isActiveDraftPackage(sourceDraftPackage);
  const activeSourceDraft = hasActiveSourceDraft ? sourceDraftPackage : undefined;
  const hasDeletedDraftInDraftIndex = isDeletedDraftPackage(existingDraftPackage);

  const hasVersionFromRequest =
    typeof ifSeqNo === "number" &&
    typeof ifPrimaryTerm === "number" &&
    Number.isInteger(ifSeqNo) &&
    Number.isInteger(ifPrimaryTerm) &&
    ifSeqNo >= 0 &&
    ifPrimaryTerm >= 0;
  const requestVersion = hasVersionFromRequest
    ? { if_seq_no: ifSeqNo, if_primary_term: ifPrimaryTerm }
    : undefined;
  const hasVersionInExistingDraft =
    typeof existingDraftPackage?._seq_no === "number" &&
    typeof existingDraftPackage?._primary_term === "number";

  if (hasActiveSourceDraft) {
    if (!hasVersionFromRequest) {
      return response({
        statusCode: 409,
        body: { message: DRAFT_CONCURRENCY_MESSAGE },
      });
    }

    const hasVersionInSourceDraft =
      typeof sourceDraftPackage?._seq_no === "number" &&
      typeof sourceDraftPackage?._primary_term === "number";

    if (
      hasVersionInSourceDraft &&
      (ifSeqNo !== activeSourceDraft?._seq_no || ifPrimaryTerm !== activeSourceDraft?._primary_term)
    ) {
      return response({
        statusCode: 409,
        body: { message: DRAFT_CONCURRENCY_MESSAGE },
      });
    }
  }

  const sourceDraft = activeSourceDraft?._source?.draft;
  const createdAt = sourceDraft?.createdAt ?? sourceDraft?.savedAt ?? savedAt;
  const createdByEmail =
    sourceDraft?.createdByEmail ??
    sourceDraft?.draftOwnerEmail ??
    activeSourceDraft?._source?.submitterEmail ??
    user.email;
  const createdByName =
    sourceDraft?.createdByName ??
    sourceDraft?.draftOwnerName ??
    activeSourceDraft?._source?.submitterName ??
    user.fullName;

  const record = {
    id: normalizedId,
    authority: resolvedAuthority,
    state: stateCode,
    deleted: false,
    seatoolStatus: SEATOOL_STATUS.DRAFT,
    stateStatus,
    cmsStatus,
    origin: "OneMAC",
    makoChangedDate: savedAt,
    changedDate: savedAt,
    statusDate: savedAt,
    submitterName: user.fullName,
    submitterEmail: user.email,
    ...(eventToActionType[draftEventName] && {
      actionType: eventToActionType[draftEventName],
    }),
    event: draftEventName,
    draft: {
      savedAt,
      createdAt,
      createdByEmail,
      createdByName,
      updatedAt: savedAt,
      updatedByEmail: user.email,
      updatedByName: user.fullName,
      draftOwnerEmail: createdByEmail,
      draftOwnerName: createdByName,
      data: draftData,
    },
  };

  const { domain, index } = getDomainAndNamespace("draftmain");
  const shouldCreateNewDraft = existingDraftPackage?.found !== true;
  const shouldUseCompareAndWrite = hasActiveDraftAtTarget && isSavingExistingDraftAtSameId;
  const shouldReplaceDeletedDraft = hasDeletedDraftInDraftIndex;
  const deletedDraftVersion =
    shouldReplaceDeletedDraft && hasVersionInExistingDraft
      ? {
          if_seq_no: existingDraftPackage._seq_no,
          if_primary_term: existingDraftPackage._primary_term,
        }
      : undefined;

  let updateResponse;
  try {
    updateResponse = await os.updateData(domain, {
      index,
      id: normalizedId,
      refresh: true,
      ...((shouldUseCompareAndWrite && requestVersion) || deletedDraftVersion || {}),
      body: {
        ...(shouldCreateNewDraft
          ? {
              script: {
                lang: "painless",
                source:
                  "if (ctx._source != null && !ctx._source.isEmpty()) { throw new IllegalStateException('draft_id_conflict'); } ctx._source = params.record;",
                params: {
                  record,
                },
              },
              scripted_upsert: true,
              upsert: {},
            }
          : shouldReplaceDeletedDraft
            ? {
                script: {
                  lang: "painless",
                  source: "ctx._source = params.record",
                  params: {
                    record,
                  },
                },
              }
            : {
                doc: record,
                doc_as_upsert: false,
              }),
      },
    });
  } catch (error) {
    if (shouldCreateNewDraft && isDraftIdConflictError(error)) {
      return response({
        statusCode: 409,
        body: { message: DRAFT_ID_CONFLICT_MESSAGE },
      });
    }

    if (isVersionConflictError(error)) {
      return response({
        statusCode: 409,
        body: {
          message: shouldCreateNewDraft ? DRAFT_ID_CONFLICT_MESSAGE : DRAFT_CONCURRENCY_MESSAGE,
        },
      });
    }

    throw error;
  }

  if (normalizedOriginalDraftId && normalizedOriginalDraftId !== normalizedId) {
    try {
      await os.updateData(domain, {
        index,
        id: normalizedOriginalDraftId,
        refresh: true,
        ...(hasVersionFromRequest && requestVersion ? requestVersion : {}),
        body: {
          doc: {
            deleted: true,
            changedDate: savedAt,
            makoChangedDate: savedAt,
            statusDate: savedAt,
          },
          doc_as_upsert: false,
        },
      });
    } catch (error) {
      try {
        await os.updateData(domain, {
          index,
          id: normalizedId,
          refresh: true,
          body: {
            doc: {
              deleted: true,
              changedDate: savedAt,
              makoChangedDate: savedAt,
              statusDate: savedAt,
            },
            doc_as_upsert: false,
          },
        });
      } catch {
        // Best effort rollback. The user-facing result remains a concurrency conflict.
      }

      if (isVersionConflictError(error)) {
        return response({
          statusCode: 409,
          body: { message: DRAFT_CONCURRENCY_MESSAGE },
        });
      }

      throw error;
    }
  }

  const updateResult = (updateResponse as any)?.body ?? updateResponse;
  const seqNo = typeof updateResult?._seq_no === "number" ? updateResult._seq_no : undefined;
  const primaryTerm =
    typeof updateResult?._primary_term === "number" ? updateResult._primary_term : undefined;

  return response({
    statusCode: 200,
    body: {
      message: "Draft saved",
      id: normalizedId,
      ...(typeof seqNo === "number" && typeof primaryTerm === "number" && { seqNo, primaryTerm }),
    },
  });
});
