import { response } from "../libs/handler";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SeatoolService } from "../services/seatoolService";
import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "../libs/auth/user";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

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
