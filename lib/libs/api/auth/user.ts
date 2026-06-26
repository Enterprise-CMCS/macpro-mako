import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayEvent } from "aws-lambda";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser, isCmsWriteUser, isHelpDeskUser } from "shared-utils";

import {
  getActiveStatesForUserByEmail,
  getLatestActiveRoleByEmail,
} from "../../../lambda/user-management/userManagementService";

const USER_ATTRIBUTE_CACHE_TTL_MS = 5 * 60 * 1000;

type UserAttributeCacheEntry = {
  expiresAt: number;
  promise: Promise<CognitoUserType | Error>;
};

const userAttributeCache = new Map<string, UserAttributeCacheEntry>();

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
  const cacheKey = `${poolID}:${userID}`;
  const cachedUser = userAttributeCache.get(cacheKey);
  const now = Date.now();

  if (cachedUser && cachedUser.expiresAt > now) {
    return cachedUser.promise;
  }

  const fetchUserPromise = (async () => {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.region,
    });

    const subFilter = `sub = "${userID}"`;

    const commandListUsers = new ListUsersCommand({
      UserPoolId: poolID,
      Filter: subFilter,
    });

    const listUsersResponse = await cognitoClient.send(commandListUsers);

    if (listUsersResponse.Users === undefined || listUsersResponse.Users.length !== 1) {
      throw new Error("No user found with this sub");
    }

    const currentUser = listUsersResponse.Users[0];
    return currentUser;
  })();

  userAttributeCache.set(cacheKey, {
    expiresAt: now + USER_ATTRIBUTE_CACHE_TTL_MS,
    promise: fetchUserPromise,
  });

  try {
    return await fetchUserPromise;
  } catch (error) {
    userAttributeCache.delete(cacheKey);

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

  const validStates = await getActiveStatesForUserByEmail(userAttributes.email);

  const activeRole = await getLatestActiveRoleByEmail(userAttributes.email);

  if (!activeRole) {
    return false;
  }

  console.log(userAttributes);
  return (
    isCmsUser({ ...userAttributes, role: activeRole.role }) ||
    (stateCode && validStates.includes(stateCode))
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
  const statesUserHasAccessTo = await getActiveStatesForUserByEmail(userAttributes.email);

  if (!activeRole) {
    return false;
  }

  return (
    isCmsWriteUser({ ...userAttributes, role: activeRole.role }) ||
    (stateCode && statesUserHasAccessTo.includes(stateCode))
  );
};

type SearchUserScope =
  | {
      stateFilter: false;
      canViewDrafts: false;
    }
  | {
      stateFilter: null;
      canViewDrafts: boolean;
    }
  | {
      stateFilter: {
        terms: {
          state: string[];
        };
      };
      canViewDrafts: false;
    };

export const getSearchUserScope = async (event: APIGatewayEvent): Promise<SearchUserScope> => {
  const authDetails = getAuthDetails(event);
  const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  const activeRole = await getLatestActiveRoleByEmail(userAttributes.email);

  if (!activeRole) {
    return {
      stateFilter: false,
      canViewDrafts: false,
    };
  }

  const userWithRole = { ...userAttributes, role: activeRole.role };

  if (!isCmsUser(userWithRole)) {
    const states = await getActiveStatesForUserByEmail(userAttributes.email, activeRole.role);
    if (states.length > 0) {
      return {
        stateFilter: {
          terms: {
            state: states.map((state) => state.toLocaleLowerCase()),
          },
        },
        canViewDrafts: false,
      };
    }
    throw "State user detected, but no associated states.  Cannot continue";
  }

  return {
    stateFilter: null,
    canViewDrafts: isHelpDeskUser(userWithRole),
  };
};

// originally intended for /_search
export const getStateFilter = async (event: APIGatewayEvent) =>
  (await getSearchUserScope(event)).stateFilter;
