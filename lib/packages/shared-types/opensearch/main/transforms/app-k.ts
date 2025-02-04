import { events, getStatus, SEATOOL_STATUS } from "shared-types";
import { seaToolFriendlyTimestamp } from "../../../../shared-utils/seatool-date-helper";

/**
 * Type extracted from the app-k event schema
 */
type AppKEventData = {
  id: string;
  event: "app-k";
  authority: string;
  proposedEffectiveDate: number;
  title: string;
  attachments: {
    appk: {
      label: string;
      files?: Array<{
        title: string;
        filename: string;
        bucket: string;
        key: string;
        uploadDate: number;
      }>;
    };
    other: {
      label: string;
      files?: Array<{
        title: string;
        filename: string;
        bucket: string;
        key: string;
        uploadDate: number;
      }>;
    };
  };
  timestamp: number;
  submitterName: string;
  submitterEmail: string;
  actionType: string;
  additionalInformation?: string | null;
};

/**
 * Represents the transformed output data structure for App K
 */
interface AppKTransformedData {
  title: string;
  additionalInformation: string | null | undefined;
  authority: string;
  changedDate: string;
  cmsStatus: ReturnType<typeof getStatus>["cmsStatus"];
  description: null;
  id: string;
  makoChangedDate: string;
  origin: "OneMAC";
  raiWithdrawEnabled: false;
  seatoolStatus: typeof SEATOOL_STATUS.SUBMITTED;
  state: string | null;
  stateStatus: ReturnType<typeof getStatus>["stateStatus"];
  statusDate: string;
  proposedEffectiveDate: string;
  subject: null;
  submissionDate: string;
  submitterEmail: string;
  submitterName: string;
  actionType: string;
  initialIntakeNeeded: true;
}

/**
 * Transforms App K data from the input format to the required OpenSearch format
 * @returns A schema transform function that converts AppKEventData to AppKTransformedData
 */
export const transform = () => {
  return events["app-k"].schema.transform((data: AppKEventData): AppKTransformedData => {
    const { stateStatus, cmsStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);
    const timestampDate = new Date(data.timestamp);
    const todayEpoch = seaToolFriendlyTimestamp(timestampDate);

    return {
      title: data.title,
      additionalInformation: data.additionalInformation,
      authority: data.authority,
      changedDate: timestampDate.toISOString(),
      cmsStatus,
      description: null,
      id: data.id,
      makoChangedDate: timestampDate.toISOString(),
      origin: "OneMAC",
      raiWithdrawEnabled: false, // Set to false for new submissions
      seatoolStatus: SEATOOL_STATUS.SUBMITTED,
      state: data.id?.split("-")?.[0],
      stateStatus,
      statusDate: new Date(todayEpoch).toISOString(),
      proposedEffectiveDate: new Date(data.proposedEffectiveDate).toISOString(),
      subject: null,
      submissionDate: timestampDate.toISOString(),
      submitterEmail: data.submitterEmail,
      submitterName: data.submitterName,
      actionType: data.actionType,
      initialIntakeNeeded: true,
    };
  });
};

export type Schema = ReturnType<typeof transform>;
