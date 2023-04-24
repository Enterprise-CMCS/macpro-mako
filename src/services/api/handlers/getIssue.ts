import { z, ZodError } from "zod";
import { response } from "../libs/handler";
import { issue } from "../models/Issue";
import { IssueService } from "../services/issueService";

export const getIssue = async ({ pathParameters }) => {
  try {
    const validParams = z.object({
      id: z.string().uuid(),
    });

    const params = validParams.parse(pathParameters);

    const foundIssue = await new IssueService(issue).getIssue(params.id);

    return response({
      statusCode: 200,
      body: foundIssue,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return response({
        statusCode: 404,
        body: { message: error },
      });
    }

    return response({
      statusCode: 404,
      body: { message: "Issue not found" },
    });
  }
};

export const handler = getIssue;
