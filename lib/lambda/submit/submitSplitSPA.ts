import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { ItemResult } from "shared-types/opensearch/main";
import { getNextSplitSPAId } from "./splitSPAId";
import { z } from "zod";

const sendSubmitSplitSPAMessage = async (currentPackage: ItemResult) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  try {
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
  } catch (err) {
    console.log("Error creating Split SPA: ", err);
  }
};

const splitSPAEventBodySchema = z.object({
  packageId: z
    .string()
    .regex(
      /^[A-Z]{2}-\d{2}-\d{4}(-[A-Z0-9]{1,4})?$/,
      "ID doesn't match format SS-YY-NNNN or SS-YY-NNNN-XXXX",
    ),
});

export const handler = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  try {
    const { packageId } = splitSPAEventBodySchema.parse(
      event.body === "string" ? JSON.parse(event.body) : event.body,
    );

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

    return await sendSubmitSplitSPAMessage(currentPackage);
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
