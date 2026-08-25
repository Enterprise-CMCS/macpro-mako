import { ErrorType, logError } from "libs/sink-lib";

import { SmartOnemacEvent } from "./parseSmartOnemacEvent";

export const handleMspRaiWithdrawalToggled = async (
  event: SmartOnemacEvent,
  topicPartition: string,
): Promise<void> => {
  logError({
    type: ErrorType.VALIDATION,
    metadata: {
      topicPartition,
      operationType: "MSP_RAI_WITHDRAWAL_TOGGLED",
      reason: "handler not implemented",
      raiId: event.raiId,
      raiName: event.raiName,
      raiWithdrawnToggle: event.raiWithdrawnToggle,
      raiWithdrawnToggleDate: event.raiWithdrawnToggleDate,
    },
  });
};
