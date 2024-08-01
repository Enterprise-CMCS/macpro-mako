import { Argv } from "yargs";
import {
  checkIfAuthenticated,
  openUrl,
  project,
  setStageFromBranch,
} from "../lib";
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const createOpenCommand = (
  name: string,
  describe: string,
  exportName: string,
) => ({
  command: name,
  describe: describe,
  builder: (yargs: Argv) =>
    yargs.option("stage", { type: "string", demandOption: false }),
  handler: async (options: { stage?: string }) => {
    await checkIfAuthenticated();
    const stage = options.stage || (await setStageFromBranch());
    const url = JSON.parse(
      (
        await new SSMClient({ region: "us-east-1" }).send(
          new GetParameterCommand({
            Name: `/${project}/${stage}/deployment-output`,
          }),
        )
      ).Parameter!.Value!,
    )[exportName];
    openUrl(url);
  },
});

export const openApp = createOpenCommand(
  "open-app",
  "Open the app in a browser.",
  "applicationEndpointUrl",
);

export const openKibana = createOpenCommand(
  "open-kibana",
  "Open the Kibana dashboard, the frontend for OpenSearch.",
  "kibanaUrl",
);
