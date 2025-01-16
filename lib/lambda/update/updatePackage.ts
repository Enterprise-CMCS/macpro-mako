import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { ItemResult } from "shared-types/opensearch/main";
import { getPackageType } from "./getPackageType";
import { events } from "shared-types";
import { z } from "zod";

const sendDeleteMessage = async (packageId: string) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }
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

  return response({
    statusCode: 200,
    body: { message: `${packageId} has been deleted.` },
  });
};

const sendUpdateValuesMessage = async ({
  currentPackage,
  updatedFields,
  changeReason,
}: {
  currentPackage: ItemResult;
  updatedFields: object;
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

  await produceMessage(
    topicName,
    currentPackage._id,
    JSON.stringify({
      id: currentPackage._id,
      ...updatedFields,
      isAdminChange: true,
      adminChangeType: "update-values",
      changeMade: changeMadeText,
      changeReason,
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `${changeMadeText} in package ${currentPackage._id}.` },
  });
};

const sendUpdateIdMessage = async ({
  currentPackage,
  updatedId,
}: {
  currentPackage: ItemResult;
  updatedId: string;
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
  console.log(packageEvent, "PACKAGE EVENT?");
  const packageSubmissionTypeSchema = events[packageEvent as keyof typeof events].baseSchema;
  console.log(packageSubmissionTypeSchema, "SCHEMA???");

  const idSchema = packageSubmissionTypeSchema.shape.id;
  console.log(idSchema, "ID SCHEMA???");
  const parsedId = idSchema.safeParse(updatedId);
  console.log(parsedId, "PARSED IDDD");

  if (!parsedId.success) {
    return response({
      statusCode: 400,
      body: parsedId.error.message,
    });
  }

  await sendDeleteMessage(currentPackage._id);
  console.log("JUST DELETED");
  await produceMessage(
    topicName,
    updatedId,
    JSON.stringify({
      id: updatedId,
      idToBeUpdated: currentPackage._id,
      ...remainingFields,
      origin: "OneMAC",
      changeMade: "ID has been updated.",
      isAdminChange: true,
      adminChangeType: "update-id",
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `The ID of package ${currentPackage._id} has been updated to ${updatedId}.` },
  });
};

const updatePackageEventBodySchema = z.object({
  packageId: z.string(),
  action: z.enum(["update-values", "update-id", "delete"]),
  updatedId: z.string().optional(),
  updatedFields: z.record(z.unknown()).optional(),
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
      return await sendDeleteMessage(packageId);
    }

    if (action === "update-id") {
      return await sendUpdateIdMessage({ currentPackage, updatedId });
    }

    if (action === "update-values") {
      return await sendUpdateValuesMessage({
        currentPackage,
        updatedFields,
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
