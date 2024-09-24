import { Argv } from "yargs";
import {
  checkIfAuthenticated,
  runCommand,
  setStageFromBranch,
  writeUiEnvFile,
} from "../lib/";

export const watch = {
  command: "watch",
  describe: "watch the project for changes",
  builder: (yargs: Argv) => {
    return yargs.option("stage", { type: "string", demandOption: false });
  },
  handler: async (args: { stage?: string }) => {
    await checkIfAuthenticated();
    const stage = args.stage || (await setStageFromBranch());

    await writeUiEnvFile(stage);

    await runCommand(
      "cdk",
      ["watch", "-c", `stage=${stage}`, "--no-rollback"],
      ".",
    );
  },
};
