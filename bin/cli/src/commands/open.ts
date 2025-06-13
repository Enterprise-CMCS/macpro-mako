import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { Argv } from "yargs";

import { checkIfAuthenticated, openUrl, project, setStageFromBranch } from "../lib";

const createOpenCommand = (name: string, describe: string, exportName: string) => ({
  command: name,
  describe: describe,
  builder: (yargs: Argv) =>
    yargs.option("stage", {
      type: "string",
      demandOption: false,
      describe: "Stage environment in AWS",
      defaultDescription: "current branch name",
    }),
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
  "Open the application url for the Stage environment in a browser. \n\n** Requires MACPro Application Admin or MACPro ReadOnly AWS credentials **\n",
  "applicationEndpointUrl",
);

export const openKibana = createOpenCommand(
  "open-kibana",
  "Open the Kibana dashboard, the frontend for OpenSearch, for the Stage environment in a browser. \n\n** Requires MACPro Application Admin or MACPro ReadOnly AWS credentials **\n",
  "kibanaUrl",
);
