import { zodValidator } from "@dannywrayuk/middy-zod-validator";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { createError } from "@middy/util";
import { APIGatewayEvent } from "shared-types";
import { isUserManagerUser } from "shared-utils";
import { z } from "zod";

import { ContextWithUser, isAuthenticated, normalizeEvent } from "../middleware";
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

export const getUserDetails = middy()
  .use(httpErrorHandler())
  .use(normalizeEvent({ opensearch: true }))
  .use(httpJsonBodyParser())
  .use(zodValidator({ eventSchema: getUserDetailsEventSchema }))
  .use(isAuthenticated({ withRoles: false, setToContext: true }))
  .handler(async (event: GetUserDetailsEvent, context: ContextWithUser) => {
    const { user } = context;
    const { userEmail } = event.body;

    // if the user wasn't set in context throw an error
    if (!user || !user.userDetails) {
      console.error("User was not set to context and isn't available");
      throw createError(500, JSON.stringify({ message: "Internal server error" }));
    }

    // if the userEmail wasn't set or it's the same as the authenticated user
    // return the details for the authenticated user
    if (!userEmail || user.userDetails.email === userEmail) {
      return {
        statusCode: 200,
        body: {
          ...user.userDetails,
          role: user.cognitoUser.role,
          states: user.cognitoUser.states,
        },
      };
    }

    // if the userEmail was set but the authenticated user does not have
    // authorization to view another user's details, throw an error
    if (!isUserManagerUser(user.cognitoUser)) {
      throw createError(403, JSON.stringify({ message: "Not authorized to view this resource" }));
    }

    // otherwise, return the userEmail user's details
    const reqUserDetails = await getUserByEmail(userEmail);
    const reqUserLatestActiveRoleObj = await getLatestActiveRoleByEmail(userEmail);
    const reqUserActiveStates = await getActiveStatesForUserByEmail(userEmail);

    return {
      statusCode: 200,
      body: {
        ...reqUserDetails,
        role: reqUserLatestActiveRoleObj?.role ?? "norole",
        states: reqUserActiveStates,
      },
    };
  });
