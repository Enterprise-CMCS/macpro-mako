import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
// import { getPackage } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { z } from "zod";

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
  id,
  item,
}: {
  id: string;
  item: Record<string, any>; // NOTE TO ANDIE: not sure if this is the right type
}) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  await produceMessage(
    topicName,
    id,
    JSON.stringify({
      ...item,
      isAdminChange: true,
      adminChangeType: "submit",
      changeMade: `${id} added to OneMAC. Package not originally submitted in OneMAC. At this time, the attachments for this package are unavailable in this system. Contact your CPOC to verify the initial submission documents.`,
      changeReason: `This is a Not Originally Submitted in OneMAC (NOSO) that users need to see in OneMAC.`,
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `${id} has been submitted.` },
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
    const { id, action, item } = submitNOSOAdminSchema.parse(
      event.body === "string" ? JSON.parse(event.body) : event.body,
    );
    console.log("ID:", id);
    console.log("item:", item);

    if (!id || !action) {
      return response({
        statusCode: 400,
        body: { message: "Package ID and action are required" },
      });
    }

    // This is throwing an error so ignore atm
    // const currentPackage = await getPackage(packageId);
    // if (currentPackage) {
    //   return response({
    //     statusCode: 403,
    //     body: { message: `Package with id: ${packageId} already exists` },
    //   });
    // }

    if (item.action === "submit") {
      //add logic for coppying over attachments
      return await sendSubmitMessage({ id, item });
    }

    return response({
      statusCode: 400,
      body: { message: "Could not create package." },
    });
  } catch (err) {
    console.error("Error has occured submitting package:", err);
    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
