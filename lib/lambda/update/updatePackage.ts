import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { z } from "zod";

type ActionType = "update-id" | "update-values" | "delete";

export const handler = async (event: APIGatewayEvent) => {
  const topicName = process.env.topicName as string;

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
    console.log(event.body, "EVENT BODY");
    const { packageId, action, updatedFields } =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : (event.body as {
            packageId: string;
            action: ActionType;
            updatedFields: object;
          });

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
      console.log(topicName, "TOPIC NAME");
      console.log(packageId, "PACKAGE ID");

      await produceMessage(
        topicName,
        packageId,
        // package being deleted?
        JSON.stringify({
          id: packageId,
          deleted: true,
          isAdminChange: true,
          origin: "mako",
        }),
      );
      // add a field to the transformed schema to specify that the package is hidden
    }

    if (action === "update-id") {
      // check authority
      await produceMessage(
        topicName,
        packageId,
        JSON.stringify({
          id: packageId,
          isAdminChange: true,
          origin: "mako",
        }),
      );
      // delete/hide old record and create new one with new id but same values
    }

    // TODO: update casing for action?
    if (action === "update-values") {
      // check authority
      const areValidFields = Object.keys(updatedFields).every((fieldKey) => {
        return fieldKey in packageResult._source;
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

      await produceMessage(
        topicName,
        packageId,
        JSON.stringify({ ...updatedFields, id: packageId, isAdminChange: true, origin: "mako" }),
      );
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
