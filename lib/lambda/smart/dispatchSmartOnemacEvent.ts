import { ErrorType, logError } from "libs/sink-lib";

import { transformMspManualRecordCreated } from "./mspManualRecordCreated";
import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
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
      return;
    }

    await reservePackageId(reservation, event);
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
