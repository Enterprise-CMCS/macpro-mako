import { response } from "../../libs/handler";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SeatoolService } from "../../services/seatoolService";
import { APIGatewayEvent } from "aws-lambda";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

export const getSeatoolData = async (event: APIGatewayEvent) => {
  try {
    const stateCode = event.pathParameters.stateCode;

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
