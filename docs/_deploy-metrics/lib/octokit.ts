import { Octokit } from "octokit";
import { createActionAuth } from "@octokit/auth-action";

export const octokit = new Octokit({
  authStrategy: process.env.PAT_TOKEN ? undefined : createActionAuth,
  auth: process.env.PAT_TOKEN,
});

export const octokitBranchesToUse =
  process.env.BRANCHES_TO_GENERATE?.split(",");
