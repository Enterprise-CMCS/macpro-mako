import { Argv } from "yargs";
import { openUrl } from "../lib";
import { fetchSSMParameter } from "../lib/ssm";

const createOpenCommand = (
  name: string,
  describe: string,
  exportName: string,
) => ({
  command: name,
  describe: describe,
  builder: (yargs: Argv) =>
    yargs.option("stage", { type: "string", demandOption: true }),
  handler: async ({ stage }: { stage: string }) => {
    const url = JSON.parse(
      await fetchSSMParameter(
        `/${process.env.PROJECT}/${stage}/deployment-output`,
      ),
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
