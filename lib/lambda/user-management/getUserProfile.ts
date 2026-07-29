import { APIGatewayEvent } from "shared-types";
import { normalizeEmail } from "shared-utils";
import { z } from "zod";

import { authenticatedMiddy, canViewUser, ContextWithAuthenticatedUser } from "../middleware";
import { getAllUserRolesByEmail } from "./userManagementService";

export const getUserProfileEventSchema = z
  .object({
    body: z.object({
      userEmail: z.string().email().optional(),
    }),
  })
  .passthrough();

export type GetUserProfileEvent = APIGatewayEvent & z.infer<typeof getUserProfileEventSchema>;

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: getUserProfileEventSchema,
})
  .use(canViewUser())
  .handler(async (event: GetUserProfileEvent, context: ContextWithAuthenticatedUser) => {
    const email = normalizeEmail(event?.body?.userEmail || context?.authenticatedUser?.email);

    if (!email) {
      throw new Error("Email is undefined");
    }

    const userRoles = await getAllUserRolesByEmail(email);

    return {
      statusCode: 200,
      body: userRoles,
    };
  });
