import { SEATOOL_STATUS, STATE_CODES, type StateCode } from "shared-types";

import { SmartOnemacEvent } from "./parseSmartOnemacEvent";

interface MspManualRecordCreated {
  id: string;
  origin: "SMART";
  authority: string;
  deleted: false;
  seatoolStatus: typeof SEATOOL_STATUS.SUBMITTED;
  state: StateCode;
  submissionDate: string;
  makoChangedDate: string;
  changedDate: string;
  statusDate: string;
  submitterName: string;
  submitterEmail: string;
  spaWaiverId: string;
  correlationId: string;
  operationType: unknown;
  creationContext: unknown;
  createdByUserId: string;
  proposedDate?: string;
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

  return {
    id: normalizedId,
    origin: "SMART" as const,
    authority: event.authority,
    deleted: false,
    // U1 locked: do not remap SMART status onto a different OneMAC status in this slice.
    seatoolStatus: SEATOOL_STATUS.SUBMITTED,
    // U8 locked: two-letter state comes from the uppercased ID prefix and must be a known code.
    state,
    submissionDate: event.createdAt,
    makoChangedDate: event.createdAt,
    changedDate: event.createdAt,
    statusDate: event.createdAt,
    submitterName: event.createdByName,
    submitterEmail: event.createdByEmail,
    spaWaiverId: event.spaWaiverId,
    correlationId: event.correlationId,
    operationType: event.operationType,
    creationContext: event.creationContext,
    createdByUserId: event.createdByUserId,
  };
};
