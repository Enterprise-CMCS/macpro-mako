import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { response } from "lib/libs/handler-lib";
import { APIGatewayEvent } from "shared-types";

export const getRoleRequests = async (event: APIGatewayEvent) => {
  try {
    const authDetails = getAuthDetails(event);
    const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
    console.log(userAttributes, "USER ATTRIBUTES?");
    const role = userAttributes["custom:cms-roles"];
    console.log(role, "WHAT IS THE ROLE");

    return response({
      statusCode: 200,
      body: role,
    });
  } catch (err: unknown) {
    console.log("An error occured: ", err);
  }
};

export const handler = getRoleRequests;
