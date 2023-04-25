import { response } from "../libs/handler";
import { createIssueSchema } from "../models/Issue";
import { IssueService } from "../services/issueService";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

export const updateIssue = async ({ pathParameters, body }) => {
  const { id } = pathParameters;

  try {
    const validIssue = createIssueSchema.parse(JSON.parse(body));

    const newIssue = await new IssueService(dynamoInstance).editIssue({
      id,
      issue: validIssue,
      tableName: process.env.tableName,
    });

    return response({
      statusCode: 201,
      body: newIssue,
    });
  } catch (error) {
    return response({
      statusCode: 404,
      body: { message: error },
    });
  }
};

export const handler = updateIssue;
