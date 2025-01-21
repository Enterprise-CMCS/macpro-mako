import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "libs/api/package";
// import { produceMessage } from "libs/api/kafka";
import { ItemResult } from "shared-types/opensearch/main";
import { getNextSplitSPAId } from "./splitSPAId";
import { z } from "zod";

const sendSubmitSplitSPAMessage = async (currentPackage: ItemResult) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  getNextSplitSPAId(currentPackage._id);
  // ID and changeMade are excluded; the rest of the object has to be spread into the new package
  // const {
  //   id: _id,
  //   changeMade: _changeMade,
  //   origin: _origin,
  //   ...remainingFields
  // } = currentPackage._source;

  // await produceMessage(
  //   topicName,
  //   updatedId, // CHANGE TO ADD ALPHABET
  //   JSON.stringify({
  //     id: updatedId, // CHANGE TO ADD ALPHABET
  //     idToBeUpdated: currentPackage._id,
  //     ...remainingFields,
  //     origin: "OneMAC",
  //     changeMade: "ID has been updated.",
  //     isAdminChange: true,
  //     adminChangeType: "update-id",
  //   }),
  // );
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

    return await sendSubmitSplitSPAMessage(currentPackage);
  } catch (err) {
    console.error("Error has occured modifying package:", err);
    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
