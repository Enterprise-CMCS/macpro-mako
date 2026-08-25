import { ErrorType, logError } from "libs/sink-lib";

import { SmartOnemacEvent } from "./parseSmartOnemacEvent";

export const handleMspSplitSpaCreated = async (
  event: SmartOnemacEvent,
  topicPartition: string,
): Promise<void> => {
  logError({
    type: ErrorType.VALIDATION,
    metadata: {
      topicPartition,
      operationType: "MSP_SPLIT_SPA_CREATED",
      reason: "handler not implemented",
      splitSpaId: event.splitSpaId,
      splitSpaWaiverId: event.splitSpaWaiverId,
      originalSpaId: event.originalSpaId,
      originalSpaWaiverId: event.originalSpaWaiverId,
      splitReason: event.splitReason,
    },
  });
};
