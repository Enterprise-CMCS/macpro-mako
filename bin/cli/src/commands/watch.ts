import { Argv } from "yargs";
import {
  checkIfAuthenticated,
  LabeledProcessRunner,
  setStageFromBranch,
  writeUiEnvFile,
} from "../lib/";

const runner = new LabeledProcessRunner();

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

    await runner.run_command_and_output(
      "CDK Watch",
      ["cdk", "watch", "-c", `stage=${stage}`, "--no-rollback"],
      ".",
    );
  },
};
