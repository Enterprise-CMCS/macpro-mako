import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { response } from "lib/libs/handler-lib";
import { APIGatewayEvent } from "shared-types";

import { getLatestActiveRoleByEmail, getUserByEmail } from "./user-management-service";

export const getUserDetails = async (event: APIGatewayEvent) => {
  try {
    const authDetails = getAuthDetails(event);

    const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);

    const userDetails = await getUserByEmail(userAttributes.email);

    const latestActiveRoleObj = await getLatestActiveRoleByEmail(userAttributes.email);

    return response({
      statusCode: 200,
      body: {
        ...userDetails,
        role: latestActiveRoleObj?.role ?? "",
      },
    });
  } catch (err: unknown) {
    console.log("An error occured: ", err);
    return response({
      statusCode: 500,
      body: { message: `Error: ${err}` },
    });
  }
};

export const handler = getUserDetails;
