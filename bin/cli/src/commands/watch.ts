import { Argv } from "yargs";

import { checkIfAuthenticated, runCommand, setStageFromBranch, writeUiEnvFile } from "../lib/";

export const watch = {
  command: "watch",
  describe:
    "Continuously watch a local AWS CDK project for changes to perform deployments and hotswaps. \n\n** Requires MACPro Application Admin AWS credentials **\n",
  builder: (yargs: Argv) => {
    return yargs.option("stage", {
      type: "string",
      demandOption: false,
      describe: "Stage environment in AWS",
      defaultDescription: "current branch name",
    });
  },
  handler: async (args: { stage?: string }) => {
    await checkIfAuthenticated();
    const stage = args.stage || (await setStageFromBranch());

    await writeUiEnvFile(stage);

    await runCommand("cdk", ["watch", "-c", `stage=${stage}`, "--no-rollback"], ".");
  },
};
