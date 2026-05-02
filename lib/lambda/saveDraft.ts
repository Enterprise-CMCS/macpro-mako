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
import { DRAFTABLE_EVENTS, type DraftableEvent, isStateUser } from "shared-utils";
import { z } from "zod";

import { authenticatedMiddy, ContextWithAuthenticatedUser } from "./middleware";
import { getUserByEmail } from "./user-management/userManagementService";

const MAX_DRAFT_DATA_BYTES = 1_000_000;

const draftDataSchema = z.record(z.unknown()).superRefine((draftData, ctx) => {
  const draftDataBytes = Buffer.byteLength(JSON.stringify(draftData), "utf8");

  if (draftDataBytes > MAX_DRAFT_DATA_BYTES) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Draft data cannot exceed ${MAX_DRAFT_DATA_BYTES} bytes.`,
    });
  }
});

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

const knownDraftAuthorities = new Set(["Medicaid SPA", "CHIP SPA", "1915(b)", "1915(c)"]);

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
        draftData: draftDataSchema,
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

type TemporaryExtensionDraftData = {
  ids?: {
    validAuthority?: {
      authority?: unknown;
    };
  };
};

type OsUpdateVersionResponse = {
  _seq_no?: number;
  _primary_term?: number;
  body?: {
    _seq_no?: number;
    _primary_term?: number;
  };
};

const areJsonValuesEqual = (left: unknown, right: unknown) => {
  return JSON.stringify(left) === JSON.stringify(right);
};

const unwrapUpdateVersionResponse = (updateResponse: unknown): OsUpdateVersionResponse => {
  if (!updateResponse || typeof updateResponse !== "object") {
    return {};
  }

  const result = updateResponse as OsUpdateVersionResponse;
  return result.body ?? result;
};

const getTemporaryExtensionAuthority = (draftData: Record<string, unknown>) => {
  return (draftData as TemporaryExtensionDraftData).ids?.validAuthority?.authority;
};

const resolveAuthority = (
  eventName: DraftableEvent,
  authority: string | undefined,
  draftData: Record<string, unknown>,
) => {
  const eventAuthority = eventToAuthority[eventName];
  if (eventAuthority) return eventAuthority;

  const normalizedAuthority = authority?.trim();
  if (normalizedAuthority && knownDraftAuthorities.has(normalizedAuthority)) {
    return normalizedAuthority;
  }

  if (
    typeof draftData.authority === "string" &&
    draftData.authority.trim() &&
    knownDraftAuthorities.has(draftData.authority.trim())
  ) {
    return draftData.authority.trim();
  }

  const nestedAuthority = getTemporaryExtensionAuthority(draftData);
  if (
    typeof nestedAuthority === "string" &&
    nestedAuthority.trim() &&
    knownDraftAuthorities.has(nestedAuthority.trim())
  ) {
    return nestedAuthority.trim();
  }

  return undefined;
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

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || "";

const canUserModifyDraft = (
  sourceDraftPackage: Awaited<ReturnType<typeof getDraftPackage>>,
  email: string,
) => {
  const currentEmail = normalizeEmail(email);
  if (!currentEmail || !isActiveDraftPackage(sourceDraftPackage)) {
    return false;
  }

  const source = sourceDraftPackage?._source;
  const actorEmails = [
    source?.draft?.createdByEmail,
    source?.draft?.draftOwnerEmail,
    source?.draft?.updatedByEmail,
    source?.submitterEmail,
  ].map(normalizeEmail);

  return actorEmails.some((actorEmail) => actorEmail && actorEmail === currentEmail);
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
  if (!DRAFTABLE_EVENTS.includes(eventName as DraftableEvent)) {
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

  const isMovingDraftToNewId =
    normalizedOriginalDraftId !== undefined && normalizedOriginalDraftId !== normalizedId;
  if (
    isMovingDraftToNewId &&
    !canUserModifyDraft(sourceDraftPackage, context.authenticatedUser.email)
  ) {
    return response({
      statusCode: 403,
      body: { message: "Not authorized to view this resource" },
    });
  }

  const isSavingExistingDraftAtSameId =
    normalizedOriginalDraftId !== undefined && normalizedOriginalDraftId === normalizedId;
  const hasActiveDraftAtTarget = isActiveDraftPackage(existingDraftPackage);
  const isRetryOfOwnedNewDraftSave =
    normalizedOriginalDraftId === undefined &&
    hasActiveDraftAtTarget &&
    canUserModifyDraft(existingDraftPackage, context.authenticatedUser.email) &&
    areJsonValuesEqual(existingDraftPackage?._source?.draft?.data, draftData);

  if (hasActiveDraftAtTarget && !isSavingExistingDraftAtSameId) {
    if (isRetryOfOwnedNewDraftSave) {
      return response({
        statusCode: 200,
        body: {
          message: "Draft saved",
          id: normalizedId,
          ...(typeof existingDraftPackage?._seq_no === "number" &&
            typeof existingDraftPackage?._primary_term === "number" && {
              seqNo: existingDraftPackage._seq_no,
              primaryTerm: existingDraftPackage._primary_term,
            }),
        },
      });
    }

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
  const shouldUpsert = existingDraftPackage?.found !== true;
  const shouldUseCompareAndWrite = hasActiveDraftAtTarget && isSavingExistingDraftAtSameId;
  const shouldReplaceDeletedDraft = hasDeletedDraftInDraftIndex;
  const deletedDraftVersion =
    shouldReplaceDeletedDraft && hasVersionInExistingDraft
      ? {
          if_seq_no: existingDraftPackage?._seq_no,
          if_primary_term: existingDraftPackage?._primary_term,
        }
      : undefined;
  const updateVersion =
    shouldUseCompareAndWrite && requestVersion ? requestVersion : (deletedDraftVersion ?? {});

  let updateResponse;
  try {
    updateResponse = await os.updateData(domain, {
      index,
      id: normalizedId,
      refresh: true,
      ...updateVersion,
      body: {
        ...(shouldReplaceDeletedDraft
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
              doc_as_upsert: shouldUpsert,
            }),
      },
    });
  } catch (error) {
    if (isVersionConflictError(error)) {
      return response({
        statusCode: 409,
        body: { message: DRAFT_CONCURRENCY_MESSAGE },
      });
    }

    throw error;
  }

  if (normalizedOriginalDraftId && normalizedOriginalDraftId !== normalizedId) {
    if (
      !userStates.includes(normalizedOriginalDraftId.slice(0, 2)) ||
      !canUserModifyDraft(sourceDraftPackage, context.authenticatedUser.email)
    ) {
      return response({
        statusCode: 403,
        body: { message: "Not authorized to view this resource" },
      });
    }

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
      } catch (rollbackError) {
        console.error("Failed to roll back moved draft after source draft delete failed", {
          originalDraftId: normalizedOriginalDraftId,
          newDraftId: normalizedId,
          rollbackError,
        });
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

  const updateResult = unwrapUpdateVersionResponse(updateResponse);
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
