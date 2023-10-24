import * as clamav from "./clamav";
import { generateSystemMessage, cleanupFolder } from "./utils";
import { FRESHCLAM_WORK_DIR } from "./constants";

export async function lambdaHandleEvent(): Promise<string> {
  generateSystemMessage(`AV definition update start time: ${new Date()}`);

  await cleanupFolder(FRESHCLAM_WORK_DIR);
  if (await clamav.updateAVDefinitonsWithFreshclam()) {
    generateSystemMessage("Folder content after freshclam ");
    await clamav.uploadAVDefinitions();

    generateSystemMessage(`AV definition update end time: ${new Date()}`);

    return "DEFINITION UPDATE SUCCESS";
  } else {
    return "DEFINITION UPDATE FAILED";
  }
}