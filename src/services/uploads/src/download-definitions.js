/**
 * Lambda function handler that will update the definitions stored in S3.
 */

import * as clamav from "./clamav";
import * as utils from "./utils";
const constants = require("./constants");

/**
 * This function will do the following
 * 0. Cleanup the folder beforehand to make sure there's enough space.
 * 1. Download the S3 definitions from the S3 bucket.
 * 2. Invoke freshclam to download the newest definitions
 * 3. Cleanup the folders
 * 4. Upload the newest definitions to the existing bucket.
 *
 * @param event Event fired to invoke the new update function.
 * @param context
 */
export async function lambdaHandleEvent() {
  utils.generateSystemMessage(`AV definition update start time: ${new Date()}`);

  await utils.cleanupFolder(constants.FRESHCLAM_WORK_DIR);
  if (await clamav.updateAVDefinitonsWithFreshclam()) {
    utils.generateSystemMessage("Folder content after freshclam ");
    await clamav.uploadAVDefinitions();

    utils.generateSystemMessage(`AV definition update end time: ${new Date()}`);

    return "DEFINITION UPDATE SUCCESS";
  } else {
    return "DEFINITION UPDATE FAILED";
  }
}

import { send, SUCCESS, FAILED } from "cfn-response-async";
export const initialDownload = async (event, context) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  const responseData = {};
  let responseStatus = SUCCESS;
  try {
    if (event.RequestType == "Create" || event.RequestType == "Update") {
      await lambdaHandleEvent();
    }
  } catch (error) {
    console.log(error);
    responseStatus = FAILED;
  } finally {
    console.log("finally");
    await send(event, context, responseStatus, responseData);
  }
};
