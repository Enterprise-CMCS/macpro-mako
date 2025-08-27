import { createError } from "@middy/util";
import { APIGatewayEvent } from "shared-types";
import { z } from "zod";

import { authenticatedMiddy, canViewUser, ContextWithAuthenticatedUser } from "../middleware";
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

export const handler = authenticatedMiddy({
  opensearch: true,
  setToContext: true,
  eventSchema: getUserDetailsEventSchema,
})
  .use(canViewUser())
  .handler(async (event: GetUserDetailsEvent, context: ContextWithAuthenticatedUser) => {
    const email = event?.body?.userEmail || context?.authenticatedUser?.email;

    if (!email) {
      throw new Error("Email is undefined");
    }

    const userDetails = await getUserByEmail(email);
    if (!userDetails) {
      throw createError(404, JSON.stringify({ message: "User not found" }));
    }

    const latestActiveRoleObj = await getLatestActiveRoleByEmail(email);
    const activeStates = await getActiveStatesForUserByEmail(email);

    return {
      statusCode: 200,
      body: {
        ...userDetails,
        role: latestActiveRoleObj?.role ?? "norole",
        states: activeStates,
      },
    };
  });
