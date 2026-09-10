import { handleDefaultSmartOnemacEvent } from "./defaultSmartOnemacEvent";
import { evaluateSmartPackageExistence, SmartKafkaMetadata } from "./evaluateSmartPackageExistence";
import { handleMspAdministrativeFieldUpdated } from "./mspAdministrativeFieldUpdated";
import { handleMspAssignmentUpdated } from "./mspAssignmentUpdated";
import { getStateFromPackageId, handleMspManualRecordCreated } from "./mspManualRecordCreated";
import { handleMspRaiWithdrawalToggled } from "./mspRaiWithdrawalToggled";
import { handleMspSplitSpaCreated } from "./mspSplitSpaCreated";
import { handleMspStatusUpdated } from "./mspStatusUpdated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import { persistSmartOnemacEvent } from "./persistSmartOnemacEvent";

const SMART_OPERATION_TYPES = [
  "MSP_MANUAL_RECORD_CREATED",
  "MSP_STATUS_UPDATED",
  "MSP_ADMINISTRATIVE_FIELD_UPDATED",
  "MSP_SPLIT_SPA_CREATED",
  "MSP_ASSIGNMENT_UPDATED",
  "MSP_RAI_WITHDRAWAL_TOGGLED",
] as const;

type SmartOperationType = (typeof SMART_OPERATION_TYPES)[number];

const isSmartOperationType = (operationType: unknown): operationType is SmartOperationType =>
  SMART_OPERATION_TYPES.some((knownOperationType) => knownOperationType === operationType);

export const dispatchSmartOnemacEvent = async (
  event: SmartOnemacEvent,
  metadata: SmartKafkaMetadata,
): Promise<void> => {
  // Skip existence lookups for unknown state prefixes; persist publishes VALIDATION.
  if (!getStateFromPackageId(event.id)) {
    await persistSmartOnemacEvent({
      event,
      ...metadata,
      existence: {
        mainById: undefined,
        mainBySpaWaiverId: undefined,
        changelogById: undefined,
      },
    });
    return;
  }

  const existence = await evaluateSmartPackageExistence(event);
  const context = { event, existence, ...metadata };
  const { operationType } = event;

  if (!isSmartOperationType(operationType)) {
    await handleDefaultSmartOnemacEvent(context);
    return;
  }

  switch (operationType) {
    case "MSP_MANUAL_RECORD_CREATED":
      await handleMspManualRecordCreated(context);
      return;
    case "MSP_STATUS_UPDATED":
      await handleMspStatusUpdated(context);
      return;
    case "MSP_ADMINISTRATIVE_FIELD_UPDATED":
      await handleMspAdministrativeFieldUpdated(context);
      return;
    case "MSP_SPLIT_SPA_CREATED":
      await handleMspSplitSpaCreated(context);
      return;
    case "MSP_ASSIGNMENT_UPDATED":
      await handleMspAssignmentUpdated(context);
      return;
    case "MSP_RAI_WITHDRAWAL_TOGGLED":
      await handleMspRaiWithdrawalToggled(context);
      return;
    default: {
      const _exhaustive: never = operationType;
      return _exhaustive;
    }
  }
};
