import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, isAuthorized, lookupUserAttributes } from "libs/api/auth/user";
import { getDraftPackage, getPackage } from "libs/api/package";
import { response } from "libs/handler-lib";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { getStatus, SEATOOL_STATUS } from "shared-types";
import { main } from "shared-types/opensearch";
import { z } from "zod";

import { authenticatedMiddy } from "./middleware";
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

const resolveAuthority = (
  eventName: DraftableEvent,
  authority: string | undefined,
  draftData: Record<string, unknown>,
) => {
  if (authority) return authority;
  if (typeof draftData.authority === "string") return draftData.authority;
  const nestedAuthority = (draftData as any)?.ids?.validAuthority?.authority;
  if (typeof nestedAuthority === "string") return nestedAuthority;
  return eventToAuthority[eventName];
};

const isActiveDraft = (packageResult?: main.ItemResult) =>
  packageResult?.found === true &&
  packageResult._source?.seatoolStatus === SEATOOL_STATUS.DRAFT &&
  packageResult._source?.deleted !== true;

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

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: saveDraftEventSchema,
}).handler(async (event: SaveDraftEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  const { id, event: eventName, authority, draftData, ifSeqNo, ifPrimaryTerm } = event.body;
  if (!draftableEvents.includes(eventName as DraftableEvent)) {
    return response({
      statusCode: 400,
      body: { message: `Drafts are not supported for event ${eventName}` },
    });
  }

  const normalizedId = id.toUpperCase();
  const stateCode = normalizedId.slice(0, 2);

  // Auth check
  const isUserAuthorized = await isAuthorized(event, stateCode);
  if (!isUserAuthorized) {
    return response({
      statusCode: 403,
      body: { message: "Unauthorized" },
    });
  }

  const existingMainPackage = await getPackage(normalizedId);
  const existingDraftPackage = await getDraftPackage(normalizedId);

  if (
    existingMainPackage &&
    existingMainPackage.found &&
    existingMainPackage._source?.deleted !== true &&
    existingMainPackage._source?.seatoolStatus !== SEATOOL_STATUS.DRAFT
  ) {
    return response({
      statusCode: 409,
      body: { message: `Record with id ${normalizedId} already exists.` },
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

  const hasActiveDraftInDraftIndex = isActiveDraft(existingDraftPackage);
  const activeExistingDraft = hasActiveDraftInDraftIndex ? existingDraftPackage : undefined;
  const hasActiveExistingDraft = Boolean(activeExistingDraft);

  const activeDraftCreatorEmail =
    activeExistingDraft?._source?.draft?.originalCreatorEmail ??
    activeExistingDraft?._source?.submitterEmail;
  const activeDraftCreatorName =
    activeExistingDraft?._source?.draft?.originalCreatorName ??
    activeExistingDraft?._source?.submitterName;
  const existingOriginalCreatorEmail = hasActiveExistingDraft ? activeDraftCreatorEmail : undefined;
  const existingOriginalCreatorName = hasActiveExistingDraft ? activeDraftCreatorName : undefined;
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
    typeof activeExistingDraft?._seq_no === "number" &&
    typeof activeExistingDraft?._primary_term === "number";

  if (hasActiveExistingDraft) {
    if (!hasVersionFromRequest) {
      return response({
        statusCode: 409,
        body: {
          message: "Draft was updated by another user. Refresh this page and try saving again.",
        },
      });
    }

    if (
      hasVersionInExistingDraft &&
      (ifSeqNo !== activeExistingDraft?._seq_no ||
        ifPrimaryTerm !== activeExistingDraft?._primary_term)
    ) {
      return response({
        statusCode: 409,
        body: {
          message: "Draft was updated by another user. Refresh this page and try saving again.",
        },
      });
    }
  }

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
      originalCreatorEmail: existingOriginalCreatorEmail ?? user.email,
      originalCreatorName: existingOriginalCreatorName ?? user.fullName,
      data: draftData,
    },
  };

  const { domain, index } = getDomainAndNamespace("draftmain");
  const shouldUpsert = !hasActiveDraftInDraftIndex;
  const shouldUseCompareAndWrite = hasActiveDraftInDraftIndex;

  let updateResponse;
  try {
    updateResponse = await os.updateData(domain, {
      index,
      id: normalizedId,
      ...(shouldUseCompareAndWrite && requestVersion ? requestVersion : {}),
      body: {
        doc: record,
        doc_as_upsert: shouldUpsert,
      },
    });
  } catch (error) {
    if (isVersionConflictError(error)) {
      return response({
        statusCode: 409,
        body: {
          message: "Draft was updated by another user. Refresh this page and try saving again.",
        },
      });
    }

    throw error;
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
