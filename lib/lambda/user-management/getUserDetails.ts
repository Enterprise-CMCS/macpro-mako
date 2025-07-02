import { zodValidator } from "@dannywrayuk/middy-zod-validator";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { createError } from "@middy/util";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
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
  .use(isAuthenticated({ setToContext: true }))
  .handler(async (event: GetUserDetailsEvent, context: ContextWithUser) => {
    const { user } = context;
    const { userEmail } = event.body;

    if (!user) {
      throw createError(401, JSON.stringify({ message: "User is not authenticated" }));
    }

    if (!userEmail || user.cognitoUser.email === userEmail) {
      return {
        statusCode: 200,
        body: {
          ...user?.cognitoUser,
        },
      };
    }

    if (!isUserManagerUser(user.cognitoUser)) {
      throw createError(403, JSON.stringify({ message: "Not authorized to view this resource" }));
    }
  });

// // retrieving user details for the requested user
// const reqUserDetails = await getUserByEmail(safeEventBody.data.userEmail);
// const reqUserLatestActiveRoleObj = await getLatestActiveRoleByEmail(
//   safeEventBody.data.userEmail,
// );
// const reqUserActiveStates = await getActiveStatesForUserByEmail(currUserAttributes.email);

// return response({
//   statusCode: 200,
//   body: {
//     ...reqUserDetails,
//     role: reqUserLatestActiveRoleObj?.role ?? "norole",
//     states: reqUserActiveStates,
//   },
// });
