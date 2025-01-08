import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { z } from "zod";
import { ItemResult } from "node_modules/shared-types/opensearch/changelog";

// create admin schemas
export const submitNOSOAdminSchema = z
  .object({
    id: z.string(),
    adminChangeType: z.literal("submit"),
  })
  .and(z.record(z.string(), z.any()));

export const transformSubmitValuesSchema = submitNOSOAdminSchema.transform((data) => ({
  ...data,
  event: "submit",
  packageId: data.id,
  timestamp: Date.now(),
}));

const sendSubmitMessage = async ({
  item,
}: {
  item: ItemResult;
  packageIDCopyAttachments: string;
}) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  await produceMessage(
    topicName,
    item._id,
    JSON.stringify({
      ...item,
      isAdminChange: true,
      adminChangeType: "submit",
      changeMade: `${item._id} added to OneMAC. Package not originally submitted in OneMAC. At this time, the attachments for this package are unavailable in this system. Contact your CPOC to verify the initial submission documents.`,
      changeReason: `This is a Not Originally Submitted in OneMAC (NOSO) that users need to see in OneMAC.`,
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `${item._id} has been submitted.` },
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
    const parseEventBody = (body: unknown) => {
      return submitNOSOAdminSchema.parse(typeof body === "string" ? JSON.parse(body) : body);
    };

    const { packageId, action } = parseEventBody(event.body);

    if (!packageId || !action) {
      return response({
        statusCode: 400,
        body: { message: "Package ID and action are required" },
      });
    }

    const currentPackage = await getPackage(packageId);

    // check if the package already exists; if it does shoudl not add new record
    if (currentPackage) {
      return response({
        statusCode: 404,
        body: { message: `Package with id: ${packageId} already exists` },
      });
    }

    if (action === "submit") {
      //add logic for coppying over attachments
      return await sendSubmitMessage(packageId);
    }

    return response({
      statusCode: 400,
      body: { message: "Could not create package." },
    });
  } catch (err) {
    console.error("Error has occured modifying package:", err);
    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
