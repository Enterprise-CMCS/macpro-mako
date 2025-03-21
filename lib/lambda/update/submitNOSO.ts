import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { response } from "libs/handler-lib";
import { getStatus } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";
import { z } from "zod";

import { submitNOSOAdminSchema } from "./adminChangeSchemas";

/** @typedef {object} json
 * @property {object} body
 * @property {string} body.id
 * @property {string} body.authority
 * @property {string} body.status
 * @property {string} body.submitterEmail
 * @property {string} body.submitterName
 * @property {string} body.adminChangeType
 * @property {string} body.mockEvent
 * @property {string} body.changeMade
 * @property {string} body.changeReason
 */
interface submitMessageType {
  id: string;
  authority: string;
  status: string;
  submitterEmail: string;
  submitterName: string;
  adminChangeType: string;
  stateStatus: string;
  cmsStatus: string;
}

const sendSubmitMessage = async (item: submitMessageType) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  const currentTime = Date.now();

  await produceMessage(
    topicName,
    item.id,
    JSON.stringify({
      ...item,
      packageId: item.id,
      origin: "SEATool",
      isAdminChange: true,
      adminChangeType: "NOSO",
      description: null,
      event: "NOSO",
      state: item.id.substring(0, 2),
      makoChangedDate: currentTime,
      changedDate: currentTime,
      statusDate: currentTime,
      timestamp: currentTime,
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `${item.id} has been submitted.` },
  });
};

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  try {
    const item = submitNOSOAdminSchema.parse(
      typeof event.body === "string" ? JSON.parse(event.body) : event.body,
    );

    const { stateStatus, cmsStatus } = getStatus(item.status);
    // check if it already exsists
    const currentPackage: ItemResult | undefined = await getPackage(item.id);

    if (currentPackage && currentPackage.found == true) {
      // if it exists and has origin OneMAC we shouldn't override it
      if (currentPackage._source.origin === "OneMAC") {
        return response({
          statusCode: 400,
          body: { message: `Package with id: ${item.id} already exists.` },
        });
      }
    }

    return await sendSubmitMessage({ ...item, stateStatus, cmsStatus });
  } catch (err) {
    console.error("Error has occured submitting package:", err);
    if (err instanceof z.ZodError) {
      return response({
        statusCode: 400,
        body: { message: err.errors },
      });
    }

    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
