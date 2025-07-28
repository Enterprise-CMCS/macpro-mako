import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { baseUserRoleRequestSchema } from "shared-types/events/legacy-user";
import { z } from "zod";

import { nonAuthenticatedMiddy } from "../middleware";

export const updateUserRolesEventSchema = z
  .object({
    body: z.object({
      updatedRoles: z.array(baseUserRoleRequestSchema),
    }),
  })
  .passthrough();

export type UpdateUserRolesEvent = APIGatewayEvent & z.infer<typeof updateUserRolesEventSchema>;

export const handler = nonAuthenticatedMiddy({
  opensearch: true,
  kafka: true,
  eventSchema: updateUserRolesEventSchema,
}).handler(async (event: UpdateUserRolesEvent) => {
  const { updatedRoles } = event.body;

  let hasError = false;

  for (const updatedRole of updatedRoles) {
    console.log("Producing message for:", updatedRole.email, updatedRole.role);

    try {
      await produceMessage(
        process.env.topicName || "",
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
    } catch (err) {
      console.error(err);
      hasError = true;
    }
  }

  if (hasError) {
    throw new Error("Error updating user roles");
  }

  return {
    statusCode: 200,
    body: { message: "Roles have been updated." },
  };
});
