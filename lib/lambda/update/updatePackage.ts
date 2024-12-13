import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { ItemResult } from "shared-types/opensearch/main";
import { getPackageType } from "./getPackageType";
import { events } from "lib/packages/shared-types";
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
  // ID and changeMade are excluded but the rest of the object has to be spread into the new package
  const { id: _id, changeMade: _changeMade, ...remainingFields } = currentPackage._source;
  if (!updatedId) {
    return response({
      statusCode: 400,
      body: { message: "New ID required to update package" },
    });
  }

  const existingPackage = await getPackage(updatedId);
  if (existingPackage) {
    return response({
      statusCode: 400,
      body: { message: "This ID already exists" },
    });
  }
  // use event of current package to determine how ID should be formatted
  // const packageChangelog = await getPackageChangelog(currentPackage._id);
  // if (!packageChangelog.hits.hits.length) {
  //   return response({
  //     statusCode: 500,
  //     body: { message: "The type of package could not be determined." },
  //   });
  // }

  // const packageWithSubmissionType = packageChangelog.hits.hits.find((pkg) => {
  //   return pkg._source.event in events;
  // });
  // const packageEvent = packageWithSubmissionType?._source.event;
  const packageEvent = await getPackageType(currentPackage._id);
  const packageSubmissionTypeSchema = events[packageEvent as keyof typeof events].baseSchema;

  if (!packageSubmissionTypeSchema) {
    return response({
      statusCode: 500,
      body: { message: "Could not validate the ID of this type of package." },
    });
  }

  const idSchema = packageSubmissionTypeSchema.shape.id;
  const parsedId = idSchema.safeParse(updatedId);

  if (!parsedId.success) {
    return response({
      statusCode: 400,
      body: parsedId.error.message,
    });
  }

  await sendDeleteMessage(currentPackage._id);
  await produceMessage(
    topicName,
    updatedId,
    JSON.stringify({
      id: updatedId,
      ...remainingFields,
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
  // const topicName = process.env.topicName as string;

  // if (!topicName) {
  //   throw new Error("Topic name is not defined");
  // }

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

    const {
      packageId,
      action,
      updatedId = packageId,
      updatedFields = {},
      changeReason,
    } = parseEventBody(event.body);

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
      return await sendDeleteMessage(packageId);
    }

    if (action === "update-id") {
      return await sendUpdateIdMessage({ currentPackage: packageResult, updatedId });
    }

    if (action === "update-values") {
      return await sendUpdateValuesMessage({
        currentPackage: packageResult,
        updatedFields,
        changeReason,
      });
    }
    return response({
      statusCode: 400,
      body: { message: "Could not update package." },
    });
  } catch (err) {
    console.error("Error has occured modifying package:", err);
    return response({
      statusCode: 500,
      body: { message: err.message || "Internal Server Error" },
    });
  }
};
