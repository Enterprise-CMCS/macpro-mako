import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayEvent } from "aws-lambda";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser, isCmsWriteUser } from "shared-utils";

import {
  getActiveStatesForUserByEmail,
  getLatestActiveRoleByEmail,
} from "../../../lambda/user-management/userManagementService";

// Retrieve user authentication details from the APIGatewayEvent
export function getAuthDetails(event: APIGatewayEvent) {
  const authProvider = event?.requestContext?.identity?.cognitoAuthenticationProvider;
  if (!authProvider) {
    throw new Error("No auth provider!");
  }
  const parts = authProvider.split(":");
  const userPoolIdParts = parts[parts.length - 3].split("/");
  const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
  const userPoolUserId = parts[parts.length - 1];

  return { userId: userPoolUserId, poolId: userPoolId };
}

// Convert Cognito user attributes to a dictionary format
function userAttrDict(cognitoUser: CognitoUserType): CognitoUserAttributes {
  const attributes: Record<string, any> = {};

  if (cognitoUser.Attributes) {
    cognitoUser.Attributes.forEach((attribute) => {
      if (attribute.Value && attribute.Name) {
        attributes[attribute.Name] = attribute.Value;
      }
    });
  }
  attributes["username"] = cognitoUser.Username;

  return attributes as CognitoUserAttributes;
}

// Retrieve and parse user attributes from Cognito using the provided userId and poolId
export async function lookupUserAttributes(
  userId: string,
  poolId: string,
): Promise<CognitoUserAttributes> {
  const fetchResult = await fetchUserFromCognito(userId, poolId);

  if (fetchResult instanceof Error) {
    throw fetchResult;
  }

  const currentUser = fetchResult as CognitoUserType;
  const attributes = userAttrDict(currentUser);

  return attributes;
}

// Fetch user data from Cognito based on the provided userId and poolId
export async function fetchUserFromCognito(
  userID: string,
  poolID: string,
): Promise<CognitoUserType | Error> {
  const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.region,
  });

  const subFilter = `sub = "${userID}"`;

  const commandListUsers = new ListUsersCommand({
    UserPoolId: poolID,
    Filter: subFilter,
  });

  try {
    const listUsersResponse = await cognitoClient.send(commandListUsers);

    if (listUsersResponse.Users === undefined || listUsersResponse.Users.length !== 1) {
      throw new Error("No user found with this sub");
    }

    const currentUser = listUsersResponse.Users[0];
    return currentUser;
  } catch (error) {
    if (error instanceof Error && error.message === "No user found with this sub") {
      throw error;
    }
    throw new Error("Error fetching user from Cognito");
  }
}

export const isAuthorized = async (event: APIGatewayEvent, stateCode?: string | null) => {
  // Retrieve authentication details of the user
  const authDetails = getAuthDetails(event);

  // Look up user attributes from Cognito
  const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);

  const activeRole = await getLatestActiveRoleByEmail(userAttributes.email);

  if (!activeRole) {
    return false;
  }

  console.log(userAttributes);
  return (
    isCmsUser({ ...userAttributes, role: activeRole.role }) ||
    (stateCode && userAttributes?.["custom:state"]?.includes(stateCode))
  );
};

export const isAuthorizedToGetPackageActions = async (
  event: APIGatewayEvent,
  stateCode?: string | null,
) => {
  // Retrieve authentication details of the user
  const authDetails = getAuthDetails(event);

  // Look up user attributes from Cognito
  const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);

  const activeRole = await getLatestActiveRoleByEmail(userAttributes.email);

  if (!activeRole) {
    return false;
  }

  return (
    isCmsWriteUser({ ...userAttributes, role: activeRole.role }) ||
    (stateCode && userAttributes?.["custom:state"]?.includes(stateCode))
  );
};

// originally intended for /_search
export const getStateFilter = async (event: APIGatewayEvent) => {
  // Retrieve authentication details of the user
  const authDetails = getAuthDetails(event);

  // Look up user attributes from Cognito
  const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);

  const activeRole = await getLatestActiveRoleByEmail(userAttributes.email);

  if (!activeRole) {
    return false;
  }

  if (!isCmsUser({ ...userAttributes, role: activeRole.role })) {
    const states = await getActiveStatesForUserByEmail(userAttributes.email);
    if (states.length > 0) {
      const filter = {
        terms: {
          //NOTE: this could instead be
          // "state.keyword": userAttributes["custom:state"],
          state: states.map((state) => state.toLocaleLowerCase()),
        },
      };

      return filter;
    }
    throw "State user detected, but no associated states.  Cannot continue";
  } else {
    console.log("CMS User detected.  No state filter required.");
    return null;
  }
};
