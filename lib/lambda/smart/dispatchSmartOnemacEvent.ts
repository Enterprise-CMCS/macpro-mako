import { ErrorType, logError } from "libs/sink-lib";

import { SmartOnemacEvent } from "./parseSmartOnemacEvent";
import { publishSmartIngestError } from "./publishSmartIngestError";
import { reservePackageId } from "./reservePackageId";

export const dispatchSmartOnemacEvent = async (
  event: SmartOnemacEvent,
  topicPartition: string,
): Promise<void> => {
  const persisted = await reservePackageId(event);
  if (persisted) {
    return;
  }

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
};
