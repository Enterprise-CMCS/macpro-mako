import { response } from "../libs/handler";
import { issueSchema } from "../models/Issue";
import { IssueService } from "../services/issueService";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

export const updateIssue = async ({ pathParameters, body }) => {
  const { id } = pathParameters;

  try {
    const validIssue = issueSchema.parse(JSON.parse(body));

    await new IssueService(dynamoInstance).editIssue({
      id,
      issue: validIssue,
      tableName: process.env.tableName,
    });

    return response({
      statusCode: 201,
    });
  } catch (error) {
    console.error({ error });
    return response({
      statusCode: 404,
      body: { message: error },
    });
  }
};

export const handler = updateIssue;
