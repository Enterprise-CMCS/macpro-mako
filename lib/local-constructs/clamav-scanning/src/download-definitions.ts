import * as clamav from "./lib/clamav";
import { generateSystemMessage, cleanupFolder } from "./lib/utils";
import { FRESHCLAM_WORK_DIR } from "./lib/constants";

export async function handler(): Promise<string> {
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
