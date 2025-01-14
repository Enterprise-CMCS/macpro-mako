import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { getPackageChangelog } from "libs/api/package";
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
      event: "legacy-admin-change", // this is added to ensure the frontend looks as it should
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

const copyAttachments = async ({
  currentPackage,
  copyAttachmentsFromId,
}: {
  currentPackage: ItemResult;
  copyAttachmentsFromId: string;
}) => {
  // get the attachementPackage
  const attachPackage = await getPackage(copyAttachmentsFromId);
  const attachPackageChangelog = await getPackageChangelog(copyAttachmentsFromId);

  if (!attachPackage || attachPackage.found == false) {
    console.error(`Copy Attachment Package of id: ${copyAttachmentsFromId} not found`);
    return;
  }

  // check if the authorities match
  if (attachPackage?._source.authority !== currentPackage._source.authority) {
    console.error(
      `Copy Attachment Package of id: ${copyAttachmentsFromId} does not have the same authority as ${currentPackage._id}.`,
    );
    return;
  }

  if (attachPackage) {
    // const attachments = structuredClone(attachPackage._source.changelog);
    console.log("ANDIEEEEEEE ***********");
    console.log("attachment package: ", attachPackage);
    // @ts-ignore
    console.log(" change log: ", attachPackageChangelog.hits.hits._source.attachments);
    // @ts-ignore
    const attachments = structuredClone(attachPackageChangelog.hits.hits._source.attachments);
    console.log("actual attachments:? ", JSON.stringify(attachments));
    console.log("Current package: ", currentPackage);
    // @ts-ignore
    // currentPackage.attachments = attachments;
  }

  return currentPackage;
};

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    // add a property for new ID
    const { packageId, action, copyAttachmentsFromId } = submitNOSOAdminSchema.parse(
      event.body === "string" ? JSON.parse(event.body) : event.body,
    );
    console.log("ID:", packageId);
    let currentPackage = await getPackage(packageId);

    // currentpackage should have been entered in seaTool
    if (!currentPackage || currentPackage.found == false) {
      return response({
        statusCode: 404,
        body: { message: `Package with id: ${packageId} is not in SEATool` },
      });
    }

    // if there was a PackageId to copy attachments for perform that action
    if (copyAttachmentsFromId) {
      const tempCopy = await copyAttachments({ currentPackage, copyAttachmentsFromId });
      // we don't want to rewrite over the package unless a valid currentPackage is returned.
      if (tempCopy) currentPackage = tempCopy;
    }

    if (action === "NOSO" && currentPackage !== undefined) {
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
