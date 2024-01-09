import { octokit } from "./octokit";
import differenceInHours from "date-fns/differenceInHours";
import { getRepoName } from "./getRepoName";

export const getMeanTimeToRecover = async (branch: string) => {
  const response = await octokit.paginate(
    "GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs",
    {
      owner: "Enterprise-CMCS",
      repo: getRepoName,
      workflow_id: "deploy.yml",
      branch,
      per_page: 100,
    },
    (response) => response.data.flat()
  );

  const getTimes = (jobs: typeof response) => {
    const result = [];
    let isFailed = false;
    let timestamp = "";

    for (const entry of jobs.reverse()) {
      if (entry.conclusion === "failure" && !timestamp) {
        isFailed = true;
        timestamp = entry.created_at;
      }
      if (isFailed && entry.conclusion === "success") {
        isFailed = false;
        result.push({
          upTime: new Date(entry.created_at),
          failedTime: new Date(timestamp),
        });
        timestamp = "";
      }
    }
    return result;
  };
  const getMeanFromTimes = (times: { failedTime: Date; upTime: Date }[]) => {
    if (times.length === 0) return 0;

    return (
      times.reduce((prev, current) => {
        const diff = differenceInHours(current.upTime, current.failedTime);

        prev += diff;
        return prev;
      }, 0) / times.length
    );
  };

  return getMeanFromTimes(getTimes(response));
};
