import { createError } from "@middy/util";
import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import { authedMiddy, canViewUser, ContextWithCurrUser } from "../middleware";
import {
  getActiveStatesForUserByEmail,
  getLatestActiveRoleByEmail,
  getUserByEmail,
} from "./userManagementService";

export const getUserDetailsEventSchema = z
  .object({
    body: z.object({
      userEmail: z.string().email().optional(),
    }),
  })
  .passthrough();

export type GetUserDetailsEvent = APIGatewayEvent & z.infer<typeof getUserDetailsEventSchema>;

export const handler = authedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: getUserDetailsEventSchema,
})
  .use(canViewUser())
  .handler(async (event: GetUserDetailsEvent, context: ContextWithCurrUser) => {
    const email = event?.body?.userEmail || context?.currUser?.email;

    if (!email) {
      console.error("Email is undefined");
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    const userDetails = await getUserByEmail(email);
    const latestActiveRoleObj = await getLatestActiveRoleByEmail(email);
    const activeStates = await getActiveStatesForUserByEmail(email);

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...userDetails,
        role: latestActiveRoleObj?.role ?? "norole",
        states: activeStates,
      }),
    };
  });
