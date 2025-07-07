import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import { authedMiddy, canViewUser, ContextWithCurrUser } from "../middleware";
import { getAllUserRolesByEmail } from "./userManagementService";

export const getUserProfileEventSchema = z
  .object({
    body: z.object({
      userEmail: z.string().email().optional(),
    }),
  })
  .passthrough();

export type GetUserProfileEvent = APIGatewayEvent & z.infer<typeof getUserProfileEventSchema>;

export const handler = authedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: getUserProfileEventSchema,
})
  .use(canViewUser())
  .handler(async (event: GetUserProfileEvent, context: ContextWithCurrUser) => {
    const email = event?.body?.userEmail || context?.currUser?.email;

    if (!email) {
      throw new Error("Email is undefined");
    }

    const userRoles = await getAllUserRolesByEmail(email);

    return {
      statusCode: 200,
      body: userRoles,
    };
  });
