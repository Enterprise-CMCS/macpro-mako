import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { response } from "lib/libs/handler-lib";
import { APIGatewayEvent } from "shared-types";

import { getLatestActiveRoleByEmail, getUserByEmail } from "./user-management-service";

export const getUserDetails = async (event: APIGatewayEvent) => {
  try {
    const authDetails = getAuthDetails(event);
    console.log("what are the auth details", authDetails);
    const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
    console.log("what are the user attributes", userAttributes);
    const userDetails = await getUserByEmail(userAttributes.email);
    console.log(userDetails, "WHAT IS USER DETAILS");
    const latestActiveRole = await getLatestActiveRoleByEmail(userAttributes.email);
    return response({
      statusCode: 200,
      body: JSON.stringify({
        ...userDetails,
        role: latestActiveRole.role,
      }),
    });
  } catch (err: unknown) {
    console.log("An error occured: ", err);
  }
};

export const handler = getUserDetails;
