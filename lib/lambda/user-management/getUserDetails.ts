import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "shared-types";
import { isUserManagerUser } from "shared-utils";
import { z } from "zod";

import {
  getActiveStatesForUserByEmail,
  getLatestActiveRoleByEmail,
  getUserByEmail,
} from "./userManagementService";

export const getUserDetailsSchema = z.object({
  userEmail: z.string().email().optional(),
});

export const getUserDetails = async (event: APIGatewayEvent) => {
  if (!event?.requestContext) {
    return response({
      statusCode: 400,
      body: { message: "Request context required" },
    });
  }
  let currAuthDetails;
  try {
    currAuthDetails = getAuthDetails(event);
  } catch (err) {
    console.error(err);
    return response({
      statusCode: 401,
      body: { message: "User not authenticated" },
    });
  }

  try {
    const { userId, poolId } = currAuthDetails;
    const currUserAttributes = await lookupUserAttributes(userId, poolId);
    const currUserDetails = await getUserByEmail(currUserAttributes.email);
    const currUserLatestActiveRoleObj = await getLatestActiveRoleByEmail(currUserAttributes.email);
    const currUserRole = currUserLatestActiveRoleObj?.role ?? "norole";

    const eventBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const safeEventBody = getUserDetailsSchema.safeParse(eventBody);
    console.log("safeEventBody", JSON.stringify(safeEventBody, null, 2));

    // if the event has a body with a userEmail, the userEmail is not the same as
    // the current user's email, and the current user is a user manager, then
    // return the data for the userEmail instead of the current user
    if (
      safeEventBody.success &&
      safeEventBody?.data?.userEmail &&
      safeEventBody.data.userEmail !== currUserAttributes.email &&
      isUserManagerUser({
        ...currUserAttributes,
        role: currUserRole,
      })
    ) {
      // retrieving user details for the requested user
      const reqUserDetails = await getUserByEmail(safeEventBody.data.userEmail);
      const reqUserLatestActiveRoleObj = await getLatestActiveRoleByEmail(
        safeEventBody.data.userEmail,
      );
      const reqUserActiveStates = await getActiveStatesForUserByEmail(currUserAttributes.email);

      return response({
        statusCode: 200,
        body: {
          ...reqUserDetails,
          role: reqUserLatestActiveRoleObj?.role ?? "norole",
          states: reqUserActiveStates,
        },
      });
    }

    const currUserActiveStates = await getActiveStatesForUserByEmail(currUserAttributes.email);

    return response({
      statusCode: 200,
      body: {
        ...currUserDetails,
        role: currUserRole,
        states: currUserActiveStates,
      },
    });
  } catch (err: unknown) {
    console.log("An error occurred: ", err);
    return response({
      statusCode: 500,
      body: { message: `Error: ${err}` },
    });
  }
};

export const handler = getUserDetails;
