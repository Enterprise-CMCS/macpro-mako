import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { getPackageChangelog } from "libs/api/package";
import { ItemResult } from "shared-types/opensearch/main";
import { submitNOSOAdminSchema } from "./adminSchemas";

export const copyAttachments = async (data: any) => {
  console.log("ANDIE******:", data, data.copyAttachmentsFromId);

  const currentPackage = await getPackage(data.id);
  const currentPackageChangelog = await getPackageChangelog(data.id);

  console.log("andie", currentPackage);
  if (!currentPackage || currentPackage.found == false) {
    console.error(`Current package id: ${currentPackage} not found`);
    return data;
  }

  //@ts-ignore
  const copyAttachmentsFromId = currentPackage?._source.copyAttachmentsFromId;
  console.log(`atempting to copy attachments from ${copyAttachmentsFromId}...`);

  // get the attachementPackage
  const attachPackage = await getPackage(copyAttachmentsFromId);
  const attachPackageChangelog = await getPackageChangelog(copyAttachmentsFromId);

  if (!attachPackage || attachPackage.found == false) {
    console.error(`Copy Attachment Package of id: ${copyAttachmentsFromId} not found`);
    return data;
  }

  // check if the authorities match
  if (attachPackage?._source.authority !== currentPackage._source.authority) {
    console.error(
      `Copy Attachment Package of id: ${copyAttachmentsFromId} does not have the same authority as ${currentPackage._id}.`,
    );
    return data;
  }

  if (attachPackage) {
    // const attachments = structuredClone(attachPackage._source.changelog);
    console.log("ANDIEEEEEEE ***********");
    console.log("attachment package: ", attachPackage);
    console.log(" change log: ", attachPackageChangelog.hits.hits[0]._source);

    const attachments = attachPackageChangelog.hits.hits.reduce((prev, current) => {
      // check that attachments exsists
      if (!current._source.attachments) return [...prev];
      return [...prev, ...current._source.attachments];
    }, []);

    console.log("actual attachments:? ", JSON.stringify(attachments));
    console.log("Current package: ", currentPackage);

    // add the attachments to the last index of the currentPackage Change Log
    const length = currentPackageChangelog.hits.hits.length;
    currentPackageChangelog.hits.hits[length]._source.attachments = attachments;
    console.log("Did I change it??", currentPackageChangelog.hits.hits[length]);

    return currentPackageChangelog.hits.hits[length];
  }
};

const sendSubmitMessage = async ({
  id,
  currentPackage,
  copyAttachmentsFromId,
}: {
  id: string;
  currentPackage: ItemResult;
  copyAttachmentsFromId?: string;
}) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  await produceMessage(
    topicName,
    id,
    JSON.stringify({
      ...currentPackage._source,
      id: id,
      packageId: id,
      copyAttachmentsFromId: copyAttachmentsFromId,
      origin: "SEATool",
      isAdminChange: true,
      adminChangeType: "NOSO",
      event: "NOSO",
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
    // add a property for new ID
    const { id, adminChangeType, copyAttachmentsFromId } = submitNOSOAdminSchema.parse(
      event.body === "string" ? JSON.parse(event.body) : event.body,
    );
    const currentPackage: ItemResult | undefined = await getPackage(id);

    // currentpackage should have been entered in seaTool
    if (!currentPackage || currentPackage.found == false) {
      return response({
        statusCode: 404,
        body: { message: `Package with id: ${id} is not in SEATool` },
      });
    }

    if (adminChangeType === "NOSO" && currentPackage !== undefined) {
      // copying over attachments is handled in sinkChangeLog
      return await sendSubmitMessage({ id, currentPackage, copyAttachmentsFromId });
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
