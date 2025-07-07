import { createError } from "@middy/util";
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
      console.error("Email is undefined");
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    let userRoles;
    try {
      userRoles = await getAllUserRolesByEmail(email);
    } catch (err) {
      console.error(err);
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(userRoles),
    };
  });
