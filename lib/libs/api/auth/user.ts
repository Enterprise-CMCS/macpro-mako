import {
  CognitoIdentityProviderClient,
  UserType as CognitoUserType,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayEvent } from "aws-lambda";
import { CognitoUserAttributes } from "shared-types";
import { isCmsUser, isCmsWriteUser } from "shared-utils";

// Retrieve user authentication details from the APIGatewayEvent
export function getAuthDetails(event: APIGatewayEvent) {
  console.log("getting auth details: ", JSON.stringify(event, null, 2));
  // console.log("identity ", { identity: event.requestContext.identity });
  const authProvider = event.requestContext.identity.cognitoAuthenticationProvider;
  console.log({ authProvider });
  if (!authProvider) {
    throw new Error("No auth provider!");
  }
  const parts = authProvider.split(":");
  const userPoolIdParts = parts[parts.length - 3].split("/");
  const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
  const userPoolUserId = parts[parts.length - 1];
  console.log({ userPoolUserId, userPoolId });

  return { userId: userPoolUserId, poolId: userPoolId };
}

// Convert Cognito user attributes to a dictionary format
function userAttrDict(cognitoUser: CognitoUserType): CognitoUserAttributes {
  console.log("userAttrDict: ", JSON.stringify(cognitoUser, null, 2));
  const attributes: Record<string, any> = {};

  if (cognitoUser.Attributes) {
    cognitoUser.Attributes.forEach((attribute) => {
      if (attribute.Value && attribute.Name) {
        attributes[attribute.Name] = attribute.Value;
      }
    });
  }
  attributes["username"] = cognitoUser.Username;
  console.log("returning attributes: ", JSON.stringify(attributes, null, 2));

  return attributes as CognitoUserAttributes;
}

// Retrieve and parse user attributes from Cognito using the provided userId and poolId
export async function lookupUserAttributes(
  userId: string,
  poolId: string,
): Promise<CognitoUserAttributes> {
  console.log("lookupUserAttributes: ", { userId, poolId });
  const fetchResult = await fetchUserFromCognito(userId, poolId);
  console.log("fetchResult: ", JSON.stringify(fetchResult, null, 2));

  if (fetchResult instanceof Error) {
    throw fetchResult;
  }

  const currentUser = fetchResult as CognitoUserType;
  console.log("currentUser: ", JSON.stringify(currentUser, null, 2));
  const attributes = userAttrDict(currentUser);
  console.log("attributes: ", JSON.stringify(attributes, null, 2));

  return attributes;
}

// Fetch user data from Cognito based on the provided userId and poolId
export async function fetchUserFromCognito(
  userID: string,
  poolID: string,
): Promise<CognitoUserType | Error> {
  console.log("fetchUserFromCognito: ", { userID, poolID });
  const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.region,
  });
  console.log("cognitoClient: ", JSON.stringify(cognitoClient, null, 2));

  const subFilter = `sub = "${userID}"`;

  const commandListUsers = new ListUsersCommand({
    UserPoolId: poolID,
    Filter: subFilter,
  });
  console.log("commandListUsers: ", JSON.stringify(commandListUsers, null, 2));

  try {
    const listUsersResponse = await cognitoClient.send(commandListUsers);
    console.log("listUserResponse: ", JSON.stringify(listUsersResponse, null, 2));

    if (listUsersResponse.Users === undefined || listUsersResponse.Users.length !== 1) {
      throw new Error("No user found with this sub");
    }

    const currentUser = listUsersResponse.Users[0];
    console.log("currentUser: ", JSON.stringify(currentUser, null, 2));
    return currentUser;
  } catch (error) {
    if (error instanceof Error && error.message === "No user found with this sub") {
      throw error;
    }
    throw new Error("Error fetching user from Cognito");
  }
}

export const isAuthorized = async (event: APIGatewayEvent, stateCode?: string | null) => {
  console.log("isAuthorized: ", JSON.stringify(event, null, 2));
  // Retrieve authentication details of the user
  const authDetails = getAuthDetails(event);
  console.log("authDetails: ", JSON.stringify(authDetails, null, 2));

  // Look up user attributes from Cognito
  const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  console.log("userAttributes: ", JSON.stringify(userAttributes, null, 2));
  return (
    isCmsUser(userAttributes) ||
    (stateCode && userAttributes?.["custom:state"]?.includes(stateCode))
  );
};

export const isAuthorizedToGetPackageActions = async (
  event: APIGatewayEvent,
  stateCode?: string | null,
) => {
  console.log(
    `isAuthorizedToGetPackageActions:\nstateCode: ${stateCode}\n event: ${JSON.stringify(
      event,
      null,
      2,
    )}`,
  );
  // Retrieve authentication details of the user
  const authDetails = getAuthDetails(event);
  console.log("authDetails: ", JSON.stringify(authDetails, null, 2));

  // Look up user attributes from Cognito
  const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  console.log("userAttributes: ", JSON.stringify(userAttributes, null, 2));
  return (
    isCmsWriteUser(userAttributes) ||
    (stateCode && userAttributes?.["custom:state"]?.includes(stateCode))
  );
};

// originally intended for /_search
export const getStateFilter = async (event: APIGatewayEvent) => {
  console.log("getStateFilter: ", JSON.stringify(event, null, 2));
  // Retrieve authentication details of the user
  const authDetails = getAuthDetails(event);
  console.log("authDetails: ", JSON.stringify(authDetails, null, 2));

  // Look up user attributes from Cognito
  const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
  console.log("userAttributes: ", JSON.stringify(userAttributes, null, 2));

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
      console.log("filter: ", JSON.stringify(filter, null, 2));

      return filter;
    } else {
      throw "State user detected, but no associated states.  Cannot continue";
    }
  } else {
    console.log("CMS User detected.  No state filter required.");
    return null;
  }
};
