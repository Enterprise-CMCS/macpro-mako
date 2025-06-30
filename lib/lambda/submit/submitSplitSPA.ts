import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { response } from "libs/handler-lib";
import { ItemResult } from "shared-types/opensearch/main";
import { z } from "zod";

import {
  SplitSPASubmission,
  submitNOSOAdminSchema,
  submitSplitSPAAdminSchema,
  submitSplitSPANOSOAdminSchema,
} from "../update/adminChangeSchemas";

/** @typedef {object} json
 * @property {object} body
 * @property {string} body.id
 * @property {string} body.newPackageIdSuffix
 * @property {string} body.changeMade
 * @property {string} body.changeReason
 * @property {string} body.status
 * @property {string} body.submitterEmail
 * @property {string} body.submitterName
 * @property {string} body.adminChangeType
 */

const sendSubmitSplitSPAMessage = async ({
  existingPackage,
  newSplitSPAId,
  changeMade,
  changeReason,
}: {
  existingPackage: ItemResult;
  newSplitSPAId: string;
  changeMade?: string;
  changeReason?: string;
}) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  const currentTime = Date.now();

  // ID and origin are excluded; the rest of the object has to be spread into the new package
  // const { id: _id, origin: _origin, ...remainingFields } = existingPackage._source;

  await produceMessage(
    topicName,
    newSplitSPAId,
    JSON.stringify({
      ...existingPackage._source,
      id: newSplitSPAId,
      idToBeUpdated: existingPackage._id,
      // ...remainingFields,
      makoChangedDate: currentTime,
      changedDate: currentTime,
      timestamp: currentTime,
      statusDate: currentTime,
      origin: "OneMAC",
      changeMade,
      changeReason,
      mockEvent: "new-medicaid-submission",
      isAdminChange: true,
      adminChangeType: "split-spa",
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `New Medicaid Split SPA ${newSplitSPAId} has been created.` },
  });
};

const submitNOSOSplitSPAFromSeatool = async (
  eventBody: SplitSPASubmission,
  newSplitSPAId: string,
) => {
  try {
    const splitSPANOSOEventBody = submitSplitSPANOSOAdminSchema.parse({
      ...eventBody,
      id: newSplitSPAId,
      authority: "Medicaid SPA",
      mockEvent: "new-medicaid-submission",
      adminChangeType: "NOSO",
    });

    const submitNOSOEventBody = submitNOSOAdminSchema.parse(splitSPANOSOEventBody);

    const lambdaClient = new LambdaClient({
      region: process.env.region,
    });
    const eventPayload = { body: JSON.stringify(submitNOSOEventBody) };
    const invokeCommandInput = {
      FunctionName: `${process.env.project}-${process.env.stage}-api-submitNOSO`,
      Payload: Buffer.from(JSON.stringify(eventPayload)),
    };

    const invokeSubmitNOSO = await lambdaClient.send(new InvokeCommand(invokeCommandInput));

    return response({
      statusCode: invokeSubmitNOSO.StatusCode,
      body: { message: `New Medicaid Split SPA ${newSplitSPAId} has been created.` },
    });
  } catch (error) {
    return response({
      statusCode: 500,
      body: { message: error },
    });
  }
};

const isFromSeatool = (existingPackage: ItemResult): boolean => {
  return existingPackage?._source.origin !== "OneMAC";
};

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { id, newPackageIdSuffix, changeMade, changeReason } =
      submitSplitSPAAdminSchema.parse(body);

    const newSplitSPAId = `${id}-${newPackageIdSuffix}`;
    const existingNewPackage = await getPackage(newSplitSPAId);

    if (existingNewPackage) {
      // if exists in seatool, create NOSO
      if (isFromSeatool(existingNewPackage)) {
        return await submitNOSOSplitSPAFromSeatool(body, newSplitSPAId);
      }
      return response({
        statusCode: 400,
        body: { message: "This split SPA ID already exists in OneMAC" },
      });
    }

    // if new package ID doesnt exist, check if original package exists and create a new one
    const existingPackage = await getPackage(id);
    if (existingPackage === undefined || !existingPackage.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given ID" },
      });
    }

    if (existingPackage._source.authority !== "Medicaid SPA") {
      return response({
        statusCode: 400,
        body: { message: "Record must be a Medicaid SPA" },
      });
    }

    return sendSubmitSplitSPAMessage({ existingPackage, newSplitSPAId, changeMade, changeReason });
  } catch (err) {
    console.error("Error has occurred modifying package:", err);
    if (err instanceof z.ZodError) {
      return response({
        statusCode: 400,
        body: { message: "Zod validation failed", issues: err.issues },
      });
    }
    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
