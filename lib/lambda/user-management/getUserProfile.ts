import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "shared-types";

import { getAllUserRolesByEmail } from "./userManagementService";

export const getUserProfile = async (event: APIGatewayEvent) => {
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
    const opensearchResponse = await getAllUserRolesByEmail(userAttributes.email);

    return response({
      statusCode: 200,
      body: opensearchResponse,
    });
  } catch (err: unknown) {
    console.log("An error occurred: ", err);
    return response({
      statusCode: 500,
      body: { message: `Error: ${err}` },
    });
  }
};

export const handler = getUserProfile;
