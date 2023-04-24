import type { APIGatewayEvent } from "aws-lambda";
import { response } from "../libs/handler";
import { createIssueSchema, issue } from "../models/Issue";
import { IssueService } from "../services/issueService";

export const createIssue = async (event: APIGatewayEvent) => {
  try {
    const validIssue = createIssueSchema.parse(JSON.parse(event.body));

    const newIssue = await new IssueService(issue).createIssue(validIssue);

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

export const handler = createIssue;
