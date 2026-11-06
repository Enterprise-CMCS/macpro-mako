import { createError } from "@middy/util";
import { produceMessage } from "libs/api/kafka";
import { APIGatewayEvent } from "shared-types";
import { baseUserRoleRequestSchema } from "shared-types/events/legacy-user";
import { canUpdateAccess } from "shared-utils";
import { z } from "zod";

import { authenticatedMiddy, ContextWithAuthenticatedUser } from "../middleware";

export const updateUserRolesEventSchema = z
  .object({
    body: z.object({
      updatedRoles: z.array(baseUserRoleRequestSchema),
    }),
  })
  .passthrough();

export type UpdateUserRolesEvent = APIGatewayEvent & z.infer<typeof updateUserRolesEventSchema>;

export const handler = authenticatedMiddy({
  opensearch: true,
  kafka: true,
  setToContext: true,
  eventSchema: updateUserRolesEventSchema,
}).handler(async (event: UpdateUserRolesEvent, context: ContextWithAuthenticatedUser) => {
  const { authenticatedUser } = context;
  const { updatedRoles } = event.body;

  if (!authenticatedUser?.email) {
    throw createError(401, JSON.stringify({ message: "User is not authenticated" }));
  }

  const doneByEmail = authenticatedUser.email;
  const doneByName = `${authenticatedUser.given_name} ${authenticatedUser.family_name}`.trim();

  let hasError = false;

  for (const updatedRole of updatedRoles) {
    if (!canUpdateAccess(authenticatedUser.role, updatedRole.role)) {
      throw createError(
        403,
        JSON.stringify({ message: "You are not authorized to perform this action." }),
      );
    }

    // State system admins may only mutate roles for territories they administer, and may
    // not update other statesystemadmin roles (mirrors getRoleRequests scoping).
    if (authenticatedUser.role === "statesystemadmin") {
      const administeredStates = authenticatedUser.states ?? [];
      if (
        updatedRole.role === "statesystemadmin" ||
        !updatedRole.territory ||
        !administeredStates.includes(updatedRole.territory)
      ) {
        throw createError(
          403,
          JSON.stringify({ message: "You are not authorized to perform this action." }),
        );
      }
    }

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
          doneByEmail,
          doneByName,
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
