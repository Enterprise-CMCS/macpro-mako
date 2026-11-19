import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";

import {
  getActiveStatesForUserByEmail,
  getUserByEmail,
} from "../../user-management/userManagementService";

/** CEntra submit requires the package state to be one of the submitter's active states. */
export async function authorizeCeSubmitter(event: APIGatewayEvent, id: string, state: string) {
  if (id.slice(0, 2) !== state) {
    throw new Error("State must match the ID prefix.");
  }

  const authDetails = getAuthDetails(event);
  const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  const authorizedStates = (await getActiveStatesForUserByEmail(userAttributes.email)).map((code) =>
    code.toUpperCase(),
  );

  if (!authorizedStates.includes(state.toUpperCase())) {
    throw "Unauthorized";
  }

  const user = await getUserByEmail(userAttributes.email);
  if (!user) {
    throw new Error("User does not exist in User OpenSearch Index");
  }

  return user;
}
