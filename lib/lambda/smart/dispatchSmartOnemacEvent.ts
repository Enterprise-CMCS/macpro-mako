import { ErrorType, logError } from "libs/sink-lib";

import { handleMspAssignmentUpdated } from "./mspAssignmentUpdated";
import { transformMspManualRecordCreated } from "./mspManualRecordCreated";
import { handleMspRaiWithdrawalToggled } from "./mspRaiWithdrawalToggled";
import { handleMspSplitSpaCreated } from "./mspSplitSpaCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import { publishSmartIngestError } from "./publishSmartIngestError";
import { reservePackageId } from "./reservePackageId";

export const dispatchSmartOnemacEvent = async (
  event: SmartOnemacEvent,
  topicPartition: string,
): Promise<void> => {
  if (event.operationType === "MSP_MANUAL_RECORD_CREATED") {
    const reservation = transformMspManualRecordCreated(event);
    if (!reservation) {
      logError({
        type: ErrorType.VALIDATION,
        metadata: {
          topicPartition,
          id: event.id,
          reason: "package ID does not start with a known two-letter state code",
        },
      });
      await publishSmartIngestError({
        errorCode: "VALIDATION",
        topicPartition,
        kafkaKey: event.id,
        correlationId: event.correlationId,
        payload: event,
      });
      return;
    }

    await reservePackageId(reservation, event);
    return;
  }

  if (event.operationType === "MSP_RAI_WITHDRAWAL_TOGGLED") {
    await handleMspRaiWithdrawalToggled(event, topicPartition);
    return;
  }

  if (event.operationType === "MSP_SPLIT_SPA_CREATED") {
    await handleMspSplitSpaCreated(event, topicPartition);
    return;
  }

  if (event.operationType === "MSP_ASSIGNMENT_UPDATED") {
    await handleMspAssignmentUpdated(event, topicPartition);
    return;
  }

  logError({
    type: ErrorType.VALIDATION,
    metadata: {
      topicPartition,
      operationType: event.operationType,
      event,
    },
  });
};
