import { ErrorType, logError } from "libs/sink-lib";

import { SmartOnemacEvent } from "./parseSmartOnemacEvent";

export const handleMspAssignmentUpdated = async (
  event: SmartOnemacEvent,
  topicPartition: string,
): Promise<void> => {
  logError({
    type: ErrorType.VALIDATION,
    metadata: {
      topicPartition,
      operationType: "MSP_ASSIGNMENT_UPDATED",
      reason: "handler not implemented",
      srtAssignmentId: event.srtAssignmentId,
      srtMember: event.srtMember,
    },
  });
};
