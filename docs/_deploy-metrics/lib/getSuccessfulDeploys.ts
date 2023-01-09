import { getRepoName } from "./getRepoName";
import { octokit } from "./octokit";

export const getSuccessfulDeploys = async (branch: string) => {
  const data = await octokit.paginate(
    "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
    {
      owner: "Enterprise-CMCS",
      repo: getRepoName,
      workflow_id: "deploy.yml",
      branch,
      per_page: 100,
    },
    (res) => res.data.flat()
  );

  const failedRuns = data.filter((run) => run.conclusion !== "success").length;
  const passedRuns = data.length - failedRuns;

  return { failedRuns, passedRuns };
};
