import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { getPackage } from "libs/api/package";
import { response } from "libs/handler-lib";
import { events } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";
import { z } from "zod";

import { getPackageType } from "./getPackageType";

/** @typedef {object} json
 * @property {object} body
 * @property {string} body.packageId
 * @property {string} body.action
 */
const sendRecoverMessage = async (currentPackage: ItemResult) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  if (!currentPackage._source.id.endsWith("del")) {
    return response({
      statusCode: 200,
      body: { message: `${currentPackage._source.id} is not a deleted package.` },
    });
  }
  const packageId = currentPackage._source.id.split(/-del/i)[0];
  const currentTime = Date.now();

  // Making a copy of the previous package and deleting it
  await produceMessage(
    topicName,
    packageId,
    JSON.stringify({
      ...currentPackage._source,
      id: packageId,
      idToBeUpdated: currentPackage._id,
      deleted: false,
      isAdminChange: true,
      adminChangeType: "update-id",
      changeMade: "Recovered Package.",
      changeReason: "Recovered package.",
      makoChangedDate: currentTime,
      changedDate: currentTime,
      statusDate: currentTime,
      timestamp: currentTime,
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `${packageId} has been recovered.` },
  });
};
/** @typedef {object} json
 * @property {object} body
 * @property {string} body.packageId
 * @property {string} body.action
 */
const sendDeleteMessage = async (currentPackage: ItemResult, timestamp?: number) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  const packageId = currentPackage._source.id;
  const currentTime = timestamp || Date.now();

  // Making a copy of the previous package and deleting it

  await produceMessage(
    topicName,
    packageId + "-del",
    JSON.stringify({
      ...currentPackage._source,
      id: packageId + "-del",
      deleted: true,
      idToBeUpdated: currentPackage._id,
      origin: "OneMAC",
      changeMade: "Deleted package.",
      changeReason: "Deleted package.",
      isAdminChange: true,
      adminChangeType: "update-id",
      makoChangedDate: currentTime,
      changedDate: currentTime,
      statusDate: currentTime,
      timestamp: currentTime,
    }),
  );
  await produceMessage(
    topicName,
    packageId,
    JSON.stringify({
      id: packageId,
      deleted: true,
      isAdminChange: true,
      adminChangeType: "delete",
      makoChangedDate: currentTime,
      changedDate: currentTime,
      statusDate: currentTime,
      timestamp: currentTime,
    }),
  );
  return response({
    statusCode: 200,
    body: { message: `${packageId} has been deleted.` },
  });
};

/** @typedef {object} json
 * @property {object} body
 * @property {string} body.packageId
 * @property {string} body.action
 * @property {object} body.updatedFields
 * @property {string} body.updatedFields.title
 */

const sendUpdateValuesMessage = async ({
  currentPackage,
  updatedFields,
  changeMade,
  changeReason,
}: {
  currentPackage: ItemResult;
  updatedFields: object;
  changeMade?: string;
  changeReason?: string;
}) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  const invalidFields = Object.keys(updatedFields).filter(
    (field) => !(field in currentPackage._source),
  );
  if (invalidFields.length > 0) {
    return response({
      statusCode: 400,
      body: { message: `Cannot update invalid field(s): ${invalidFields.join(", ")}` },
    });
  }

  if ("id" in updatedFields) {
    return response({
      statusCode: 400,
      body: { message: "ID is not a valid field to update" },
    });
  }

  const fieldNames = Object.keys(updatedFields).join(", ");
  const changeMadeText = `${fieldNames} ${
    Object.keys(updatedFields).length > 1 ? "have" : "has"
  } been updated`;

  const currentTime = Date.now();

  await produceMessage(
    topicName,
    currentPackage._id,
    JSON.stringify({
      id: currentPackage._id,
      isAdminChange: true,
      adminChangeType: "update-values",
      changeMade,
      changeReason,
      makoChangedDate: currentTime,
      changedDate: currentTime,
      statusDate: currentTime,
      timestamp: currentTime,
      ...updatedFields,
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `${changeMadeText} in package ${currentPackage._id}.` },
  });
};

/** @typedef {object} json
 * @property {object} body
 * @property {string} body.packageId
 * @property {string} body.action
 * @property {string} body.updatedId
 */
const sendUpdateIdMessage = async ({
  currentPackage,
  updatedId,
  changeMade,
  changeReason,
}: {
  currentPackage: ItemResult;
  updatedId: string;
  changeMade?: string;
  changeReason?: string;
}) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
  // ID and changeMade are excluded; the rest of the object has to be spread into the new package
  const {
    id: _id,
    changeMade: _changeMade,
    origin: _origin,
    ...remainingFields
  } = currentPackage._source;
  if (updatedId === currentPackage._id) {
    return response({
      statusCode: 400,
      body: { message: "New ID required to update package" },
    });
  }
  // check if a package with this new ID already exists
  const packageExists = await getPackage(updatedId);
  if (packageExists?.found) {
    return response({
      statusCode: 400,
      body: { message: "This ID already exists" },
    });
  }
  // use event of current package to determine how ID should be formatted
  const packageEvent = await getPackageType(currentPackage._id);
  const packageSubmissionTypeSchema = events[packageEvent as keyof typeof events].baseSchema;

  const idSchema = packageSubmissionTypeSchema.shape.id;
  const parsedId = idSchema.safeParse(updatedId);

  if (!parsedId.success) {
    return response({
      statusCode: 400,
      body: parsedId.error.message,
    });
  }

  const currentTime = Date.now();

  await produceMessage(
    topicName,
    updatedId,
    JSON.stringify({
      id: updatedId,
      ...remainingFields,
      idToBeUpdated: currentPackage._id,
      origin: "OneMAC",
      changeMade,
      changeReason,
      isAdminChange: true,
      adminChangeType: "update-id",
      makoChangedDate: currentTime,
      changedDate: currentTime,
      statusDate: currentTime,
      timestamp: currentTime,
    }),
  );
  await sendDeleteMessage(currentPackage, currentTime);
  return response({
    statusCode: 200,
    body: { message: `The ID of package ${currentPackage._id} has been updated to ${updatedId}.` },
  });
};

const updatePackageEventBodySchema = z.object({
  packageId: z.string(),
  action: z.enum(["update-values", "update-id", "delete", "recover"]),
  updatedId: z.string().optional(),
  updatedFields: z.record(z.unknown()).optional(),
  changeMade: z.string().optional(),
  changeReason: z.string().optional(),
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
      return updatePackageEventBodySchema.parse(typeof body === "string" ? JSON.parse(body) : body);
    };
    let body = {
      packageId: "",
      action: "",
    };
    if (typeof event.body === "string") {
      body = JSON.parse(event.body);
    } else {
      body = event.body;
    }
    if (!body.packageId || !body.action) {
      return response({
        statusCode: 400,
        body: { message: "Package ID and action are required" },
      });
    }
    const {
      packageId,
      action,
      updatedId = packageId,
      updatedFields = {},
      changeMade,
      changeReason,
    } = parseEventBody(event.body);

    const currentPackage = await getPackage(packageId);
    if (!currentPackage || currentPackage.found == false) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    if (action === "delete") {
      return await sendDeleteMessage(currentPackage);
    }
    if (action === "recover") {
      return await sendRecoverMessage(currentPackage);
    }
    if (action === "update-id") {
      return await sendUpdateIdMessage({ currentPackage, updatedId, changeMade, changeReason });
    }

    if (action === "update-values") {
      return await sendUpdateValuesMessage({
        currentPackage,
        updatedFields,
        changeMade,
        changeReason,
      });
    }
  } catch (err) {
    console.error("Error has occured modifying package:", err);
    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
