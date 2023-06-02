import { octokit } from "./octokit";
import { getRepoName } from "./getRepoName";
import JSZip from 'jszip';

export interface Resource   {
  PhysicalResourceId: string
  ResourceType: string
  ResourceStatus: string
  LogicalResourceId: string
  LastUpdatedTimestamp: string
  StackName: string
}

const unzip = async (blob: string) => {
  const zip = await JSZip.loadAsync(blob);
  const data = zip.file('aws-resources.json')?.async('string')
  return data
}

export const getAwsResources = async (branch: string) => {

  // get a list of the artifacts created by the deploy step
  const artifacts = await octokit.paginate(
    "GET /repos/{owner}/{repo}/actions/artifacts",
    {
      owner: "Enterprise-CMCS",
      repo: getRepoName,
      per_page: 100,
      name: 'aws-resources-' + branch
    },
    (res) => res.data.flat()
  );

  // sort them by most recent
  artifacts.sort((a, b) => {
    const dateA = new Date(a.created_at as string);
    const dateB = new Date(b.created_at as string);
    return dateB.getTime() - dateA.getTime();
  });

  if (!artifacts[0]) {
    throw 'No artifact found'
  }

  // get the downloadable zip file
  const response = await octokit.request(
    `GET /repos/{owner}/{repo}/actions/artifacts/${artifacts[0].id}/zip`,
    {
      owner: "Enterprise-CMCS",
      repo: getRepoName,
    }
  );

  const data = await unzip(response.data) as string

  return JSON.parse(data) as unknown as Resource[]

};
