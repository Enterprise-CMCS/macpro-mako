import { response } from "../libs/handler";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { IssueService } from "../services/issueService";
import { Issue } from "../models";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

export const getIssues = async () => {
  try {
    const issues = await new IssueService(dynamoInstance).getIssues({
      tableName: process.env.tableName,
    });

    console.log({ issues });
    return response<Issue[]>({
      statusCode: 200,
      body: issues,
    });
  } catch (error) {
    console.log({ error });
    return response({
      statusCode: 404,
      body: { message: JSON.stringify(error) },
    });
  }
};

export const handler = getIssues;
