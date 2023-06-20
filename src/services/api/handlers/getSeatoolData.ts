import { response } from "../libs/handler";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SeatoolService } from "../services/seatoolService";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

export const getSeatoolData = async () => {
  try {
    const seaData = await new SeatoolService(dynamoInstance).getIssues({
      tableName: process.env.tableName,
    });

    return response<unknown>({
      statusCode: 200,
      body: seaData,
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 404,
      body: { message: JSON.stringify(error) },
    });
  }
};

export const handler = getSeatoolData;
