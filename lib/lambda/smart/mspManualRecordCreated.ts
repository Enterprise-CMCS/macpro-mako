import { getStatus, SEATOOL_STATUS, STATE_CODES, type StateCode } from "shared-types";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import { persistSmartOnemacEvent } from "./persistSmartOnemacEvent";

const EMPTY_DISPLAY_TEXT = "";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * OneMAC-shaped main-index document for a new SMART package reservation.
 */
export interface MspManualRecordCreated {
  id: string;
  origin: "SMART";
  deleted: false;
  seatoolStatus: typeof SEATOOL_STATUS.SUBMITTED;
  cmsStatus: string;
  stateStatus: string;
  state: StateCode;
  authority: string;
  submitterName: string;
  submitterEmail: string;
  submissionDate: string;
  makoChangedDate: string;
  changedDate: string;
  statusDate: string;
  spaWaiverId: string;
  correlationId: string;
  initialIntakeNeeded: true;
  operationType?: string;
  creationContext?: string;
  createdByUserId?: string;
  proposedDate?: string | number;
  approvedEffectiveDate?: string | number;
  subject?: string;
  description?: string;
}

export const getStateFromPackageId = (id: string): StateCode | undefined => {
  const state = id.toUpperCase().slice(0, 2);
  return (STATE_CODES as readonly string[]).includes(state) ? (state as StateCode) : undefined;
};

export const transformMspManualRecordCreated = (
  event: SmartOnemacEvent,
): MspManualRecordCreated | undefined => {
  const normalizedId = event.id.toUpperCase();
  const state = getStateFromPackageId(normalizedId);

  if (!state) {
    return undefined;
  }

  const { cmsStatus, stateStatus } = getStatus(SEATOOL_STATUS.SUBMITTED);
  const createdAt = event.createdAt;

  return {
    id: normalizedId,
    origin: "SMART",
    deleted: false,
    seatoolStatus: SEATOOL_STATUS.SUBMITTED,
    cmsStatus,
    stateStatus,
    state,
    authority: event.authority,
    submissionDate: createdAt,
    makoChangedDate: createdAt,
    changedDate: createdAt,
    statusDate: createdAt,
    submitterName: isNonEmptyString(event.createdByName) ? event.createdByName : EMPTY_DISPLAY_TEXT,
    submitterEmail: isNonEmptyString(event.createdByEmail)
      ? event.createdByEmail
      : EMPTY_DISPLAY_TEXT,
    spaWaiverId: event.spaWaiverId,
    correlationId: event.correlationId,
    initialIntakeNeeded: true,
    ...(isNonEmptyString(event.operationType) ? { operationType: event.operationType } : {}),
    ...(isNonEmptyString(event.creationContext) ? { creationContext: event.creationContext } : {}),
    ...(isNonEmptyString(event.createdByUserId) ? { createdByUserId: event.createdByUserId } : {}),
    ...(event.proposedEffectiveDate !== undefined
      ? { proposedDate: event.proposedEffectiveDate }
      : {}),
    ...(typeof event.approvedEffectiveDate === "number" ||
    isNonEmptyString(event.approvedEffectiveDate)
      ? { approvedEffectiveDate: event.approvedEffectiveDate }
      : {}),
    ...(isNonEmptyString(event.subject) ? { subject: event.subject } : {}),
    ...(isNonEmptyString(event.description) ? { description: event.description } : {}),
  };
};

export const handleMspManualRecordCreated = async (
  context: SmartOnemacEventContext,
): Promise<void> => {
  if (!(await persistSmartOnemacEvent(context))) {
    return;
  }
  // Reviewer hook: add OneMAC manual-record-created writes here.
};
