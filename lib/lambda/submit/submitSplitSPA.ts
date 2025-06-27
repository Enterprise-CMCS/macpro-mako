import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { response } from "libs/handler-lib";
// import { events } from "shared-types/events";
import { ItemResult } from "shared-types/opensearch/main";
import { z } from "zod";

import {
  submitNOSOAdminSchema,
  submitSplitSPAAdminSchema,
  submitSplitSPANOSOAdminSchema,
} from "../update/adminChangeSchemas";

// import { getNextSplitSPAId } from "./getNextSplitSPAId";

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
  const { id: _id, origin: _origin, ...remainingFields } = existingPackage._source;

  await produceMessage(
    topicName,
    newSplitSPAId,
    JSON.stringify({
      id: newSplitSPAId,
      idToBeUpdated: existingPackage._id,
      ...remainingFields,
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

    // if new split spa id exists and origin is undefined, it exists in seatool. copy data over
    const existingNewPackage = await getPackage(newSplitSPAId);
    console.log(existingNewPackage, "EXISTING NEW PACKAGE");
    if (existingNewPackage) {
      // if exists in seatool, create NOSO
      console.log("PACKAGE EXISTS", existingNewPackage);
      if (existingNewPackage?._source?.origin !== "OneMAC") {
        try {
          const submitNOSOEventBody = submitSplitSPANOSOAdminSchema.parse({
            id: newSplitSPAId,
            authority: "Medicaid SPA",
            mockEvent: "new-medicaid-submission",
            adminChangeType: "NOSO",
            ...body,
          });
          console.log(submitNOSOEventBody, "NOSO EVENT BODY");
          const lambdaClient = new LambdaClient({
            region: process.env.region,
          });
          const invokeCommandInput = {
            FunctionName: `${process.env.project}-${process.env.stage}-${process.env.stack}-submitNOSO`,
            Payload: Buffer.from(JSON.stringify(submitNOSOEventBody)),
          };
          console.log(invokeCommandInput, "OKKKKKK");
          const invokeSubmitNOSO = await lambdaClient.send(new InvokeCommand(invokeCommandInput));
          console.log(invokeSubmitNOSO, "INVOKE SUBMIT NOSO");
          return response({
            statusCode: invokeSubmitNOSO.StatusCode,
            body: { message: invokeSubmitNOSO.Payload },
          });
        } catch (error) {
          return response({
            statusCode: 500,
            body: { message: error },
          });
        }
      } else {
        return response({
          statusCode: 400,
          body: { message: "This split SPA ID already exists in OneMAC" },
        });
      }
    }

    // if new new package ID doesnt exist, check if original package exists and create a new one
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
