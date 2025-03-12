import pino from "pino";

import {
  cleanupFolder,
  FRESHCLAM_WORK_DIR,
  updateAVDefinitonsWithFreshclam,
  uploadAVDefinitions,
} from "../lib";
const logger = pino();

export async function handler(): Promise<string> {
  logger.info(`AV definition update start time: ${new Date()}`);
  await cleanupFolder(FRESHCLAM_WORK_DIR);
  if (await updateAVDefinitonsWithFreshclam()) {
    logger.info("Folder content after freshclam ");
    await uploadAVDefinitions();
    logger.info(`AV definition update end time: ${new Date()}`);
    return "DEFINITION UPDATE SUCCESS";
  }
  logger.error(`AV definition update failed: ${new Date()}`);
  return "DEFINITION UPDATE FAILED";
}
