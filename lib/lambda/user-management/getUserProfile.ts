import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { APIGatewayEvent } from "shared-types";

import { getAllUserRolesByEmail } from "./user-management-service";

export const getUserProfile = async (event: APIGatewayEvent) => {
  try {
    console.log("this is the event: ", event);
    const authDetails = getAuthDetails(event);
    console.log("what are the auth details", authDetails);
    const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
    console.log("what are the user attributes", userAttributes);

    return await getAllUserRolesByEmail(userAttributes.email);
  } catch (err: unknown) {
    console.log("An error occured: ", err);
  }
};

export const handler = getUserProfile;
