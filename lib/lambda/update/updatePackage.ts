import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { z } from "zod";
import { opensearch } from "shared-types";

type ActionType = "update-id" | "update-values" | "delete";

export const updatePackage = async (event: APIGatewayEvent) => {
  const topicName = process.env.topicName as string;
  const something: opensearch.main.Document = {};

  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }
  try {
    const { packageId, action, updatedFields } = JSON.parse(event.body) as {
      packageId: string;
      action: ActionType;
      updatedFields: object;
    };

    if (!packageId || !action) {
      return response({
        statusCode: 400,
        body: { message: "Package ID and action are required" },
      });
    }

    const packageResult = await getPackage(packageId);

    if (!packageResult) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    if (action === "delete") {
      // const expectedResult = z.object({
      //   id: z.string(),
      //   event: z.literal("delete"),
      // });
      // check authority
      await produceMessage(
        topicName,
        packageId,
        // package being deleted?
        JSON.stringify({
          deleted: true,
        }),
      );
      // add a field to the transformed schema to specify that the package is hidden
    }

    if (action === "update-id") {
      // check authority
      await produceMessage(
        topicName,
        packageId,
        // fix
        // only update fields in the schema
        JSON.stringify({
          isAdminChange: true,
        }),
        //   JSON.stringify({
        //     state: "CA",
        //   }),
      );
      // delete/hide old record and create new one with new id but same values
    }

    // TODO: update casing for action?
    if (action === "update-values") {
      // check authority
      const areValidFields = Object.keys(updatedFields).every((fieldKey) => {
        return fieldKey in packageResult;
      });

      if (!areValidFields) {
        return response({
          statusCode: 500,
          body: {
            message: `A field not in the current opensearch document was trying to be modified`,
          },
        });
      }

      if ("id" in updatedFields) {
        return response({
          statusCode: 500,
          body: { message: "ID is not a valid field to update" },
        });
      }

      console.log("in updated values", updatedFields);
      await produceMessage(topicName, packageId, JSON.stringify(updatedFields));
    }
    return response({
      statusCode: 200,
      body: { message: "success" },
    });
  } catch (err) {
    console.error("Error has occured modifying package:", err);
    return response({
      statusCode: 500,
      body: { message: err.message },
    });
  }
};
