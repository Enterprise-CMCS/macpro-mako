import { z, ZodError } from "zod";
import { response } from "../libs/handler";
import { IssueService } from "../services/issueService";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoInstance = new DynamoDBClient({ region: process.env.region });

export const deleteIssue = async ({ pathParameters }) => {
  try {
    const validParams = z.object({
      id: z.string().uuid(),
    });

    const params = validParams.parse(pathParameters);

    const issueToDelete = await new IssueService(dynamoInstance).deleteIssue({
      id: params.id,
      tableName: process.env.tableName,
    });

    return response({
      statusCode: 200,
      body: issueToDelete,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return response({
        statusCode: 404,
        body: { message: error },
      });
    }
  }
};

export const handler = deleteIssue;
