import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { ItemResult } from "shared-types/opensearch/main";
// import { baseSchema } from "lib/packages/shared-types/events/new-medicaid-submission";
import { events } from "shared-types/events";
import { getNextSplitSPAId } from "./getNextSplitSPAId";
import { z } from "zod";

const sendSubmitSplitSPAMessage = async (currentPackage: ItemResult) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  const newId = await getNextSplitSPAId(currentPackage._id);
  if (!newId) {
    throw new Error("Error getting next Split SPA Id");
  }

  // ID and changeMade are excluded; the rest of the object has to be spread into the new package
  const {
    id: _id,
    changeMade: _changeMade,
    origin: _origin,
    ...remainingFields
  } = currentPackage._source;

  await produceMessage(
    topicName,
    newId,
    JSON.stringify({
      id: newId,
      idToBeUpdated: currentPackage._id,
      ...remainingFields,
      origin: "OneMAC",
      changeMade: "OneMAC Admin has added a package to OneMAC.",
      changeReason: "Per request from CMS, this package was added to OneMAC.",
      isAdminChange: true,
      adminChangeType: "split-spa",
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `New Medicaid Split SPA ${newId} has been created.` },
  });
};

const splitSPAEventBodySchema = z.object({
  packageId: events["new-medicaid-submission"].baseSchema.shape.id,
});

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const parseEventBody = (body: unknown) => {
      return splitSPAEventBodySchema.parse(typeof body === "string" ? JSON.parse(body) : body);
    };

    const { packageId } = parseEventBody(event.body);
    if (!packageId) {
      return response({
        statusCode: 400,
        body: { message: "Package ID to split is required" },
      });
    }

    const currentPackage = await getPackage(packageId);
    if (!currentPackage || currentPackage.found == false) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    if (currentPackage._source.authority !== "Medicaid SPA") {
      return response({
        statusCode: 400,
        body: { message: "Record must be a Medicaid SPA" },
      });
    }

    return sendSubmitSplitSPAMessage(currentPackage);
  } catch (err) {
    console.error("Error has occured modifying package:", err);
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
