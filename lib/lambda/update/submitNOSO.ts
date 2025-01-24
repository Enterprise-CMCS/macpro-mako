import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { ItemResult } from "shared-types/opensearch/main";
import { submitNOSOAdminSchema } from "./adminChangeSchemas";
import { z } from "zod";

import { getStatus } from "shared-types";

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
  console.log("sending the follwing message...");
  console.log("package data: ", JSON.stringify(item));

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
      makoChangedDate: Date.now(),
      changedDate: Date.now(),
      statusDate: Date.now(),
      changeMade: `${item.id} added to OneMAC. Package not originally submitted in OneMAC. At this time, the attachments for this package are unavailable in this system. Contact your CPOC to verify the initial submission documents.`,
      changeReason: `This is a Not Originally Submitted in OneMAC (NOSO) that users need to see in OneMAC.`,
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
    console.log("trying to submit a NOSO...");
    // add a property for new ID
    const item = submitNOSOAdminSchema.parse(
      typeof event.body === "string" ? JSON.parse(event.body) : event.body,
    );

    const { stateStatus, cmsStatus } = getStatus(item.status);
    // check if it already exsists
    const currentPackage: ItemResult | undefined = await getPackage(item.id);

    console.log("checking package already exists...");

    // currentpackage should have been entered in seaTool
    if (currentPackage && currentPackage.found == true) {
      return response({
        statusCode: 400,
        body: { message: `Package with id: ${item.id} already exists.` },
      });
    }

    if (item.adminChangeType === "NOSO") {
      console.log("attempting to send submit message...");
      // copying over attachments is handled in sinkChangeLog
      return await sendSubmitMessage({ ...item, stateStatus, cmsStatus });
    }

    return response({
      statusCode: 400,
      body: { message: "Could not create OneMAC package." },
    });
  } catch (err) {
    console.error("Error has occured submitting package:", err);
    if (err instanceof z.ZodError) {
      return response({
        statusCode: 400,
        body: { message: JSON.stringify(err.errors) },
      });
    }

    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
