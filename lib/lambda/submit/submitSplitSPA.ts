import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { response } from "libs/handler-lib";
import { events } from "shared-types/events";
import { ItemResult } from "shared-types/opensearch/main";
import { z } from "zod";

import { getNextSplitSPAId } from "./getNextSplitSPAId";

/** @typedef {object} json
 * @property {object} body
 * @property {string} body.packageId
 */
const sendSubmitSplitSPAMessage = async (currentPackage: ItemResult) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  const newId = await getNextSplitSPAId(currentPackage._id);
  if (!newId) {
    throw new Error("Error getting next Split SPA Id");
  }

  const currentTime = Date.now();

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
      makoChangedDate: currentTime,
      changedDate: currentTime,
      timestamp: currentTime,
      statusDate: currentTime,
      origin: "OneMAC",
      changeMade: "OneMAC Admin has added a package to OneMAC.",
      changeReason: "Per request from CMS, this package was added to OneMAC.",
      mockEvent: "new-medicaid-submission",
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
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { packageId } = splitSPAEventBodySchema.parse(body);

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
