import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "shared-types";

import { getLatestActiveRoleByEmail, getUserByEmail } from "./userManagementService";

export const getUserDetails = async (event: APIGatewayEvent) => {
  if (!event?.requestContext) {
    return response({
      statusCode: 400,
      body: { message: "Request context required" },
    });
  }
  let authDetails;
  try {
    authDetails = getAuthDetails(event);
  } catch (err) {
    console.error(err);
    return response({
      statusCode: 401,
      body: { message: "User not authenticated" },
    });
  }

  try {
    const { userId, poolId } = authDetails;
    const userAttributes = await lookupUserAttributes(userId, poolId);
    const userDetails = await getUserByEmail(userAttributes.email);
    const latestActiveRoleObj = await getLatestActiveRoleByEmail(userAttributes.email);

    return response({
      statusCode: 200,
      body: {
        ...userDetails,
        role: latestActiveRoleObj?.role ?? "norole",
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
