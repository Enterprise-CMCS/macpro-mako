import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";
import { BaseUserRoleRequest, baseUserRoleRequestSchema } from "shared-types/events/legacy-user";
import { z } from "zod";

export const updatedRolesSchema = z.object({
  updatedRoles: z.array(baseUserRoleRequestSchema),
});

export const updateUserRoles = async (event: APIGatewayEvent) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  if (!event?.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  try {
    const eventBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const safeEventBody = updatedRolesSchema.safeParse(eventBody);

    if (!safeEventBody.success && safeEventBody.error) {
      return response({
        statusCode: 400,
        body: { message: "Incorrect role object format", error: safeEventBody.error.message },
      });
    }

    await Promise.all(
      safeEventBody.data.updatedRoles.map(async (updatedRole: BaseUserRoleRequest) => {
        console.log("Producing message for:", updatedRole.email, updatedRole.role);

        await produceMessage(
          topicName,
          `${updatedRole.email}_${updatedRole.territory}_${updatedRole.role}`,
          JSON.stringify({
            email: updatedRole.email,
            status: updatedRole.status,
            territory: updatedRole.territory,
            role: updatedRole.role,
            doneByEmail: updatedRole.doneByEmail,
            doneByName: updatedRole.doneByName,
            date: Date.now(),
            eventType: updatedRole.eventType,
          }),
        );
      }),
    );

    return response({
      statusCode: 200,
      body: { message: "Roles have been updated." },
    });
  } catch (err: unknown) {
    console.log("An error occurred: ", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = updateUserRoles;
