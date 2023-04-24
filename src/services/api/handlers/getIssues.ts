import { response } from "../libs/handler";
import { issue } from "../models";
import { IssueService } from "../services/issueService";

export const getIssues = async () => {
  try {
    const issues = await new IssueService(issue).getIssues();

    return response({
      statusCode: 200,
      body: issues,
    });
  } catch (error) {
    return response({
      statusCode: 404,
      body: { message: "Issues not found" },
    });
  }
};

export const handler = getIssues;
