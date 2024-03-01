import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoUserAttributes } from "shared-types";
import { APIGatewayEvent } from "aws-lambda";
import { isCmsWriteUser, isCmsUser } from "shared-utils";

// Retrieve user authentication details from the APIGatewayEvent
export function getAuthDetails(event: APIGatewayEvent) {
  const authProvider =
    event.requestContext.identity.cognitoAuthenticationProvider;
  const testing = event.requestContext.authorizer?.claims;

  console.log("claims object", JSON.stringify(testing));

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

  return attributes as CognitoUserAttributes;
}

// Retrieve and parse user attributes from Cognito using the provided userId and poolId
export async function lookupUserAttributes(
  userId: string,
  poolId: string
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
async function fetchUserFromCognito(
  userID: string,
  poolID: string
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

    if (
      listUsersResponse.Users === undefined ||
      listUsersResponse.Users.length !== 1
    ) {
      throw new Error("No user found with this sub");
    }

    const currentUser = listUsersResponse.Users[0];
    return currentUser;
  } catch (error) {
    throw new Error("Error fetching user from Cognito");
  }
}

export const isAuthorized = async (
  event: APIGatewayEvent,
  stateCode?: string | null
) => {
  // Retrieve authentication details of the user
  const authDetails = getAuthDetails(event);

  // Look up user attributes from Cognito
  const userAttributes = await lookupUserAttributes(
    authDetails.userId,
    authDetails.poolId
  );
  return (
    isCmsUser(userAttributes) ||
    (stateCode && userAttributes?.["custom:state"]?.includes(stateCode))
  );
};

export const isAuthorizedToGetPackageActions = async (
  event: APIGatewayEvent,
  stateCode?: string | null
) => {
  // Retrieve authentication details of the user
  const authDetails = getAuthDetails(event);

  // Look up user attributes from Cognito
  const userAttributes = await lookupUserAttributes(
    authDetails.userId,
    authDetails.poolId
  );
  return (
    isCmsWriteUser(userAttributes) ||
    (stateCode && userAttributes?.["custom:state"]?.includes(stateCode))
  );
};

// originally intended for /_search
export const getStateFilter = async (event: APIGatewayEvent) => {
  // Retrieve authentication details of the user
  const authDetails = getAuthDetails(event);

  // Look up user attributes from Cognito
  const userAttributes = await lookupUserAttributes(
    authDetails.userId,
    authDetails.poolId
  );

  if (!isCmsUser(userAttributes)) {
    if (userAttributes["custom:state"]) {
      const filter = {
        terms: {
          //NOTE: this could instead be
          // "state.keyword": userAttributes["custom:state"],
          state: userAttributes["custom:state"]
            .split(",")
            .map((state) => state.toLocaleLowerCase()),
        },
      };

      return filter;
    } else {
      throw "State user detected, but no associated states.  Cannot continue";
    }
  } else {
    console.log("CMS User detected.  No state filter required.");
    return null;
  }
};
