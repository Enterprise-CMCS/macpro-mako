import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { getPackage, getPackageChangelog } from "libs/api/package";
import { produceMessage } from "libs/api/kafka";
import { ItemResult } from "shared-types/opensearch/main";
import { events } from "lib/packages/shared-types";
import { z } from "zod";

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

  return response({
    statusCode: 200,
    body: { message: `${packageId} has been deleted.` },
  });
};

const sendUpdateValuesMessage = async ({
  topicName,
  currentPackage,
  updatedFields,
  changeReason,
}: {
  topicName: string;
  currentPackage: ItemResult;
  updatedFields: object;
  changeReason?: string;
}) => {
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
  topicName,
  currentPackage,
  updatedId,
}: {
  topicName: string;
  currentPackage: ItemResult;
  updatedId: string;
}) => {
  //eslint-disable-next-line
  const { _id, _index, _source } = currentPackage;
  //eslint-disable-next-line
  const { id, changeMade, ...remainingFields } = _source;

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
  const packageChangelog = await getPackageChangelog(_id);
  if (!packageChangelog.hits.hits.length) {
    return response({
      statusCode: 500,
      body: { message: "The type of package could not be determined." },
    });
  }

  const packageWithSubmissionType = packageChangelog.hits.hits.find((pkg) => {
    return pkg._source.event in events;
  });
  const packageEvent = packageWithSubmissionType?._source.event;
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

  await sendDeleteMessage(topicName, currentPackage._id);
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
      return await sendDeleteMessage(topicName, packageId);
    }

    if (action === "update-id") {
      return await sendUpdateIdMessage({ topicName, currentPackage: packageResult, updatedId });

      // if (!updatedId) {
      //   return response({
      //     statusCode: 400,
      //     body: { message: "New ID required to update package" },
      //   });
      // }
      // const existingPackage = await getPackage(updatedId);
      // if (existingPackage) {
      //   return response({
      //     statusCode: 400,
      //     body: { message: "This ID already exists" },
      //   });
      // }
      // // use event of current package to determine how ID should be formatted
      // const packageChangelog = await getPackageChangelog(packageId);
      // if (packageChangelog.hits.hits.length) {
      //   const packageWithSubmissionType = packageChangelog.hits.hits.find((packageChange) => {
      //     return packageChange._source.event in events;
      //   });
      //   const packageEvent = packageWithSubmissionType?._source.event;
      //   const packageSubmissionTypeSchema = events[packageEvent as keyof typeof events].baseSchema;
      //   console.log(packageSubmissionTypeSchema, "PACKAGE TYPE SCHEMA");
      //   const idSchema = packageSubmissionTypeSchema.shape.id;
      //   const parsedId = idSchema.safeParse(updatedId);

      //   if (parsedId.success) {
      //     await sendUpdateIdMessage(topicName, packageResult, updatedId);
      //   } else {
      //     console.log(parsedId.error.message, "ERROR MSG");
      //     return response({
      //       statusCode: 400,
      //       body: parsedId.error.message[0],
      //     });
      //   }
    }

    if (action === "update-values") {
      // const areValidFields = Object.keys(updatedFields).every((fieldKey) => {
      //   return fieldKey in packageResult._source;
      // });
      // const invalidFields = Object.keys(updatedFields).filter((field) => !(field in packageResult._source));
      // if (invalidFields.length > 0) {
      //   return response({
      //     statusCode: 400,
      //     body: { message: `Cannot update invalid field(s): ${invalidFields.join(", ")}` },
      //   });
      // }

      // if (!areValidFields) {
      //   return response({
      //     statusCode: 400,
      //     body: {
      //       message: "Cannot update invalid field(s)",
      //     },
      //   });
      // }

      // if ("id" in updatedFields) {
      //   return response({
      //     statusCode: 400,
      //     body: { message: "ID is not a valid field to update" },
      //   });
      // }

      // const fieldNames = Object.keys(updatedFields).join(", ");
      // const changeMadeText = `${fieldNames} ${
      //   Object.keys(updatedFields).length > 1 ? "have" : "has"
      // } been updated.`;

      return await sendUpdateValuesMessage({
        topicName,
        currentPackage: packageResult,
        updatedFields,
        changeReason,
      });
      // if (Object.keys(updatedFields).length > 1) {
      //   await sendUpdateValuesMessage(
      //     {topicName,
      //     packageId,
      //     updatedFields,
      //     changeMadeText: `${Object.keys(updatedFields).join(", ")} have been updated.`,
      //     changeReason},
      //   );
      // } else {
      //   await sendUpdateValuesMessage(
      //     {topicName,
      //     packageId,
      //     updatedFields,
      //     changeMadeText: `${Object.keys(updatedFields)} has been updated.`,
      //     changeReason},
      //   );
      // }
      // return response({
      //   statusCode: 200,
      //   body: { message: "success" },
      // });
    }
    // return response({
    //   statusCode: 200,
    //   body: { message: "success" },
    // });
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
