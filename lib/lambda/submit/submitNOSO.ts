import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { z } from "zod";
import { ItemResult } from "shared-types/opensearch/main";

// create admin schemas
export const submitNOSOAdminSchema = z
  .object({
    id: z.string(),
    adminChangeType: z.literal("NOSO"),
  })
  .and(z.record(z.string(), z.any()));

export const transformSubmitValuesSchema = submitNOSOAdminSchema.transform((data) => ({
  ...data,
  event: "NOSO",
  packageId: data.id,
  timestamp: Date.now(),
}));

const sendSubmitMessage = async ({
  packageId,
  currentPackage,
}: {
  packageId: string;
  currentPackage: ItemResult;
}) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  await produceMessage(
    topicName,
    packageId,
    JSON.stringify({
      ...currentPackage._source,
      origin: "SEATool",
      isAdminChange: true,
      adminChangeType: "NOSO",
      changeMade: `${packageId} added to OneMAC. Package not originally submitted in OneMAC. At this time, the attachments for this package are unavailable in this system. Contact your CPOC to verify the initial submission documents.`,
      changeReason: `This is a Not Originally Submitted in OneMAC (NOSO) that users need to see in OneMAC.`,
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `${packageId} has been submitted.` },
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
    const { packageId, action } = submitNOSOAdminSchema.parse(
      event.body === "string" ? JSON.parse(event.body) : event.body,
    );
    console.log("ID:", packageId);

    const currentPackage = await getPackage(packageId);

    // currentpackage should have been entered in seaTool
    if (!currentPackage || currentPackage.found == false) {
      return response({
        statusCode: 404,
        body: { message: `Package with id: ${packageId} is not in SEATool` },
      });
    }

    if (action === "NOSO") {
      //add logic for coppying over attachments
      return await sendSubmitMessage({ packageId, currentPackage });
    }

    return response({
      statusCode: 400,
      body: { message: "Could not create OneMAC package." },
    });
  } catch (err) {
    console.error("Error has occured submitting package:", err);
    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
