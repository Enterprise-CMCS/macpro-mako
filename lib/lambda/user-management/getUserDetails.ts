import { createError } from "@middy/util";
import { APIGatewayEvent } from "shared-types";
import { normalizeEmail } from "shared-utils";
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
    const selfEmail = normalizeEmail(context?.authenticatedUser?.email);
    const requestedEmail = normalizeEmail(event?.body?.userEmail);
    const email = requestedEmail || selfEmail;

    if (!email) {
      throw new Error("Email is undefined");
    }

    const storedUser = await getUserByEmail(email);
    // A new stage has no user document until the profile event is indexed.
    // The signed-in user's role still lives in the roles index, and a 404
    // here hides that role and bounces login back to the home page.
    if (!storedUser && email !== selfEmail) {
      throw createError(404, JSON.stringify({ message: "User not found" }));
    }

    const latestActiveRoleObj = await getLatestActiveRoleByEmail(email);
    const activeStates = await getActiveStatesForUserByEmail(email);
    const { given_name: givenName, family_name: familyName } = context.authenticatedUser ?? {};

    return {
      statusCode: 200,
      body: {
        ...(storedUser ?? {
          id: `${email}_user-information`,
          eventType: "user-info",
          email,
          fullName: [givenName, familyName].filter(Boolean).join(" "),
        }),
        role: latestActiveRoleObj?.role ?? "norole",
        states: activeStates,
      },
    };
  });
