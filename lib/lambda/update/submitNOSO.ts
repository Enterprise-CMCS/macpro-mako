import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { ItemResult } from "shared-types/opensearch/main";
import { submitNOSOAdminSchema } from "./adminChangeSchemas";
import { z } from "zod";

import { getStatus } from "shared-types";

/*
EXAMPLE EVENT JSON:

{
  "body": {
    "id": "CO-34304.R00.01", 
    "authority": "1915(c)",
    "status": "Submitted",
    "submitterEmail": "george@example.com",
    "submitterName": "George Harrison",
    "adminChangeType": "NOSO",
    "mockEvent": "app-k", //needed for future actions
    "changeMade": "CO-34304.R00.01 added to OneMAC.Package not originally submitted in OneMAC. Contact your CPOC to verify the initial submission documents.",
    "changeReason": "Per request from CMS, this package was added to OneMAC."
  }
}

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
      timeStamp: currentTime,
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
