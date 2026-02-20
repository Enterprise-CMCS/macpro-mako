import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, isAuthorized, lookupUserAttributes } from "libs/api/auth/user";
import { getPackage } from "libs/api/package";
import { response } from "libs/handler-lib";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { getStatus, SEATOOL_STATUS } from "shared-types";
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
        id: z.string(),
        event: z.string(),
        authority: z.string().optional(),
        draftData: z.record(z.unknown()),
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

  const { id, event: eventName, authority, draftData } = event.body;
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

  const existingPackage = await getPackage(normalizedId);
  if (
    existingPackage &&
    existingPackage.found &&
    existingPackage._source?.seatoolStatus !== SEATOOL_STATUS.DRAFT
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
      data: draftData,
    },
  };

  const { domain, index } = getDomainAndNamespace("main");

  await os.updateData(domain, {
    index,
    id: normalizedId,
    body: {
      doc: record,
      doc_as_upsert: true,
    },
  });

  return response({
    statusCode: 200,
    body: { message: "Draft saved", id: normalizedId },
  });
});
