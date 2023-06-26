import { response } from "../../libs/handler";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SeatoolService } from "../../services/seatoolService";
import { APIGatewayEvent } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoUserAttributes } from "shared-types";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

export function getAuthDetails(event: APIGatewayEvent) {
  try {
    const authProvider =
      event.requestContext.identity.cognitoAuthenticationProvider;
    const parts = authProvider.split(":");
    const userPoolIdParts = parts[parts.length - 3].split("/");

    const userPoolId = userPoolIdParts[userPoolIdParts.length - 1];
    const userPoolUserId = parts[parts.length - 1];

    return { userId: userPoolUserId, poolId: userPoolId };
  } catch (e) {
    console.error({ e });
  }
}

// pulls the data from the cognito user into a dictionary
function userAttrDict(cognitoUser: CognitoUserType): CognitoUserAttributes {
  const attributes = {};

  if (cognitoUser.Attributes) {
    cognitoUser.Attributes.forEach((attribute) => {
      if (attribute.Value && attribute.Name) {
        attributes[attribute.Name] = attribute.Value;
      }
    });
  }

  return attributes as CognitoUserAttributes;
}

export const getParsedObject = (obj: CognitoUserAttributes) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      try {
        return [key, JSON.parse(value as string)];
      } catch (error) {
        return [key, value];
      }
    })
  );

async function lookupUserAttributes(
  userId: string,
  poolId: string
): Promise<CognitoUserAttributes> {
  const fetchResult = await fetchUserFromCognito(userId, poolId);

  const currentUser = fetchResult as CognitoUserType;

  const attributes = userAttrDict(currentUser);

  return getParsedObject(attributes) as CognitoUserAttributes;
}

async function fetchUserFromCognito(userID: string, poolID: string) {
  const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.region,
  });

  const subFilter = `sub = "${userID}"`;

  const commandListUsers = new ListUsersCommand({
    UserPoolId: poolID,
    Filter: subFilter,
  });
  const listUsersResponse = await cognitoClient.send(commandListUsers);

  if (
    listUsersResponse.Users === undefined ||
    listUsersResponse.Users.length !== 1
  ) {
    return new Error("No user found with this sub");
  }

  const currentUser = listUsersResponse.Users[0];
  return currentUser;
}

export const getSeatoolData = async (event: APIGatewayEvent) => {
  try {
    const authDetails = getAuthDetails(event);
    const userAttributes = await lookupUserAttributes(
      authDetails.userId,
      authDetails.poolId
    );

    const stateCode = event.pathParameters.stateCode;

    if (
      !userAttributes ||
      !userAttributes["custom:state_codes"].includes(stateCode)
    ) {
      return response({
        statusCode: 401,
        body: { message: "User is not authorized to access this resource" },
      });
    }

    const seaData = await new SeatoolService(dynamoInstance).getIssues({
      tableName: process.env.tableName,
      stateCode: stateCode,
    });

    return response<unknown>({
      statusCode: 200,
      body: seaData,
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 404,
      body: { message: error },
    });
  }
};

export const handler = getSeatoolData;
