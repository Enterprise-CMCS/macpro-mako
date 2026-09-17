import pino from "pino";

import { SmartOnemacEventContext } from "./evaluateSmartPackageExistence";
import { persistSmartOnemacEvent } from "./persistSmartOnemacEvent";

const logger = pino();

export const handleDefaultSmartOnemacEvent = async (
  context: SmartOnemacEventContext,
): Promise<void> => {
  const { event, topicPartition } = context;
  logger.info(
    { id: event.id, topicPartition },
    "Only the minimal SMART envelope was received; applying default persistence",
  );
  await persistSmartOnemacEvent(context);
};
