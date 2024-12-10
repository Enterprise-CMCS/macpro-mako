import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { ItemResult } from "shared-types/opensearch/main";

type ActionType = "update-id" | "update-values" | "delete";

const sendDeleteMessage = async (topicName: string, packageId: string) => {
  await produceMessage(
    topicName,
    packageId,
    JSON.stringify({
      id: packageId,
      deleted: true,
      isAdminChange: true,
      adminChangeType: "delete",
    }),
  );
};

const sendUpdateValuesMessage = async (
  topicName: string,
  packageId: string,
  updatedFields: object,
  changeMadeText: string,
  changeReason?: string,
) => {
  await produceMessage(
    topicName,
    packageId,
    JSON.stringify({
      id: packageId,
      ...updatedFields,
      isAdminChange: true,
      adminChangeType: "update-values",
      changeMade: changeMadeText,
      changeReason,
    }),
  );
};

const sendUpdateIdMessage = async (
  topicName: string,
  currentPackage: ItemResult,
  updatedId: string,
) => {
  // get fields of package with old id and copy
  //eslint-disable-next-line
  const { _id, ...originalProperties } = currentPackage;
  await sendDeleteMessage(topicName, currentPackage._id);
  // send message with new id and old fields
  await produceMessage(
    topicName,
    updatedId,
    JSON.stringify({
      _id: updatedId,
      originalProperties,
      isAdminChange: true,
      adminChangeType: "update-id",
    }),
  );
};

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
    // TODO: allow user to input title of the accordion
    const { packageId, action, updatedId, updatedFields, changeReason } =
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
      await sendDeleteMessage(topicName, packageId);
    }

    if (action === "update-id") {
      if (!updatedId) {
        return response({
          statusCode: 400,
          body: { message: "New ID required to update package" },
        });
      }
      // handle regex validation in frontend later or here too?
      const existingPackage = await getPackage(updatedId);
      if (existingPackage) {
        return response({
          statusCode: 400,
          body: { message: "This ID already exists" },
        });
      }

      await sendUpdateIdMessage(topicName, packageResult, updatedId);
      // delete/hide old record and create new one with new id but same values
    }

    if (action === "update-values") {
      const areValidFields = Object.keys(updatedFields).every((fieldKey) => {
        return fieldKey in packageResult._source;
      });

      let changeMadeText: string;

      if (!areValidFields) {
        return response({
          statusCode: 500,
          body: {
            message: `Cannot update invalid field(s)`,
          },
        });
      }

      if ("id" in updatedFields) {
        return response({
          statusCode: 500,
          body: { message: "ID is not a valid field to update" },
        });
      }

      if (Object.keys(updatedFields).length > 1) {
        changeMadeText = `${Object.keys(updatedFields).join(", ")} have been updated.`;
      } else {
        changeMadeText = `${Object.keys(updatedFields)} has been updated.`;
      }

      await sendUpdateValuesMessage(
        topicName,
        packageId,
        updatedFields,
        changeMadeText,
        changeReason,
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
