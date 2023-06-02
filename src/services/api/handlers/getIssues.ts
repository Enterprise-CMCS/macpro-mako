import { response } from "../libs/handler";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { IssueService } from "../services/issueService";
import { Issue } from "shared-types";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

export const getIssues = async () => {
  try {
    const issues = await new IssueService(dynamoInstance).getIssues({
      tableName: process.env.tableName,
    });

    return response<Issue[]>({
      statusCode: 200,
      body: issues,
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 404,
      body: { message: JSON.stringify(error) },
    });
  }
};

export const handler = getIssues;
