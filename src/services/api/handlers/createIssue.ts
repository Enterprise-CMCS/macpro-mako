import type { APIGatewayEvent } from "aws-lambda";
import { response } from "../libs/handler";
import { createIssueSchema } from "../models/Issue";
import { IssueService } from "../services/issueService";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

export const createIssue = async (event: APIGatewayEvent) => {
  try {
    const validIssue = createIssueSchema.parse(JSON.parse(event.body));

    const newIssue = await new IssueService(dynamoInstance).createIssue({
      issue: validIssue,
      tableName: process.env.tableName,
    });

    return response({
      statusCode: 201,
      body: newIssue,
    });
  } catch (error) {
    console.log({ error });
    return response({
      statusCode: 404,
      body: error,
    });
  }
};

export const handler = createIssue;
