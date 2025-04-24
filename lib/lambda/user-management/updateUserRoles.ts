import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "lib/libs/api/kafka";
import { response } from "lib/libs/handler-lib";
import {
  BaseUserRoleRequest,
  baseUserRoleRequestSchema,
} from "lib/packages/shared-types/events/legacy-user";
import { z } from "zod";

export const updatedRolesSchema = z.object({
  updatedRoles: z.array(baseUserRoleRequestSchema),
});

export const updateUserRoles = async (event: APIGatewayEvent) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  const eventBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  const safeEventBody = updatedRolesSchema.safeParse(eventBody);

  if (safeEventBody.error) {
    return response({
      statusCode: 400,
      body: { message: "Incorrect role object format", error: safeEventBody.error.message },
    });
  }
  if (safeEventBody.success) {
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
  }
};

export const handler = updateUserRoles;
