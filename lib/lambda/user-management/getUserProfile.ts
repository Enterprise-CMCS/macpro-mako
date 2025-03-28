import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { APIGatewayEvent } from "shared-types";

import { getAllUserRolesByEmail } from "./user-management-service";

export const getUserProfile = async (event: APIGatewayEvent) => {
  const authDetails = getAuthDetails(event);
  const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);

  return await getAllUserRolesByEmail(userAttributes.email);
};

export const handler = getUserProfile;
