import { z } from "zod";

import { legacyAttachmentSchema } from "../attachments";
import { getStatus, SEATOOL_STATUS } from "../index";
import { ONEMAC_LEGACY_ORIGIN } from "../opensearch/main/transforms/legacy-transforms";
import { legacySharedSchema } from "./legacy-shared";

// Event schema for legacy records
export const legacyEventSchema = legacySharedSchema
  .merge(
    z.object({
      eventTimestamp: z.number().nullish(),
      lastEventTimestamp: z.number().nullish(),
      lastActivityTimestamp: z.number().nullish(),
      submissionTimestamp: z.number().nullish(),
      pk: z.string(),
      currentStatus: z.string().nullish(),
      subStatus: z.string().nullish(),
      proposedEffectiveDate: z.string().nullish(),
      GSI1pk: z.string(),
      componentId: z.string(),
      waiverAuthority: z.string().nullish(),
      title: z.string().nullish(),
      parentId: z.string().nullish(),
      temporaryExtensionType: z.string().nullish(),
      attachments: z.array(legacyAttachmentSchema).nullish(),
      latestRaiResponseTimestamp: z.number().nullish(),
    }),
  )
  .transform((data) => {
    const seatoolStatus = getSeaToolStatusFromLegacyStatus(data.currentStatus);
    const { stateStatus, cmsStatus } = getStatus(seatoolStatus);
    const lastEventIsoDate = getIsoDateFromTimestamp(data.lastActivityTimestamp);
    const submissionIsoDate = getIsoDateFromTimestamp(data.submissionTimestamp);
    const isRaiResponseWithdrawEnabled = data.subStatus === "Withdraw Formal RAI Response Enabled";
    const initialIntakeNeeded = ![SEATOOL_STATUS.PENDING].includes(seatoolStatus);

    return {
      ...data,
      proposedEffectiveDate: null, // blank out the value that will be transformed, we handle it below
      additionalInformation: data.additionalInformation,
      changedDate: lastEventIsoDate, // eventTimestamp as ISO string
      cmsStatus, // Derived status
      id: data.pk, // pk becomes id
      makoChangedDate: lastEventIsoDate,
      origin: ONEMAC_LEGACY_ORIGIN,
      raiWithdrawEnabled: isRaiResponseWithdrawEnabled,
      seatoolStatus,
      state: data.pk?.slice(0, 2), // Extract state from pk
      stateStatus,
      statusDate: lastEventIsoDate,
      proposedDate:
        data.proposedEffectiveDate && !isNaN(new Date(data.proposedEffectiveDate).getTime())
          ? data.proposedEffectiveDate
          : null,
      submissionDate: submissionIsoDate,
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      initialIntakeNeeded: initialIntakeNeeded,
      raiReceivedDate: data.latestRaiResponseTimestamp
        ? new Date(data.latestRaiResponseTimestamp).toISOString()
        : null,
    };
  });

function getIsoDateFromTimestamp(timestamp: number | null | undefined) {
  if (!timestamp || timestamp === 0) {
    return null;
  }
  return new Date(timestamp).toISOString();
}

function getSeaToolStatusFromLegacyStatus(legacyStatus: string | null | undefined) {
  if (!legacyStatus) {
    return SEATOOL_STATUS.UNKNOWN;
  }

  switch (legacyStatus) {
    case "Inactivated":
      return SEATOOL_STATUS.UNKNOWN;
    case "Submitted":
    case "TE Requested":
      return SEATOOL_STATUS.SUBMITTED;
    case "Under Review":
      return SEATOOL_STATUS.PENDING;
    case "Pending - Concurrence":
      return SEATOOL_STATUS.PENDING_CONCURRENCE;
    case "Pending - Approval":
      return SEATOOL_STATUS.PENDING_APPROVAL;
    case "RAI Issued":
      return SEATOOL_STATUS.PENDING_RAI;
    case "Approved":
      return SEATOOL_STATUS.APPROVED;
    case "Disapproved":
      return SEATOOL_STATUS.DISAPPROVED;
    case "Package Withdrawn":
      return SEATOOL_STATUS.WITHDRAWN;
    case "Withdrawal Requested":
      return SEATOOL_STATUS.WITHDRAW_REQUESTED;
    case "Waiver Terminated":
      return SEATOOL_STATUS.TERMINATED;
    case "Formal RAI Response - Withdrawal Requested":
      return SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED;
    default:
      return SEATOOL_STATUS.UNKNOWN;
  }
}

export type LegacyEvent = z.infer<typeof legacyEventSchema>;
