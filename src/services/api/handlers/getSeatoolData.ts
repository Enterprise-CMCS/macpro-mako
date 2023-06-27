import { response } from "../libs/handler";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SeatoolService } from "../services/seatoolService";
import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "../libs/auth/user";

// Create an instance of DynamoDB client
const dynamoInstance = new DynamoDBClient({ region: process.env.region });

// Handler function to get Seatool data
export const getSeatoolData = async (event: APIGatewayEvent) => {
  try {
    // Retrieve authentication details of the user
    const authDetails = getAuthDetails(event);

    // Look up user attributes from Cognito
    const userAttributes = await lookupUserAttributes(
      authDetails.userId,
      authDetails.poolId
    );

    // Retrieve the state code from the path parameters
    const stateCode = event.pathParameters?.stateCode;

    // Check if stateCode is provided
    if (!stateCode) {
      return response({
        statusCode: 400,
        body: { message: "State code is missing" },
      });
    }

    // Check if user is authorized to access the resource based on their attributes
    if (
      !userAttributes ||
      !userAttributes["custom:state_codes"]?.includes(stateCode)
    ) {
      return response({
        statusCode: 403,
        body: { message: "User is not authorized to access this resource" },
      });
    }

    // Retrieve Seatool data using the SeatoolService
    const seaData = await new SeatoolService(dynamoInstance).getIssues({
      tableName: process.env.tableName,
      stateCode: stateCode,
    });

    if (!seaData) {
      return response({
        statusCode: 404,
        body: { message: "No Seatool data found for the provided state code" },
      });
    }

    return response<unknown>({
      statusCode: 200,
      body: seaData,
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getSeatoolData;
