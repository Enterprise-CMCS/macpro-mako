import { z, ZodError } from "zod";
import { response } from "../libs/handler";
import { issue } from "../models/Issue";
import { IssueService } from "../services/issueService";

export const deleteIssue = async ({ pathParameters }) => {
  try {
    const validParams = z.object({
      id: z.string().uuid(),
    });

    const params = validParams.parse(pathParameters);

    const issueToDelete = await new IssueService(issue).deleteIssue(params.id);

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
