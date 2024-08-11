import { Argv } from "yargs";
import {
  checkIfAuthenticated,
  LabeledProcessRunner,
  setStageFromBranch,
  writeUiEnvFile,
} from "../lib";

const runner = new LabeledProcessRunner();

export const ui = {
  command: "ui",
  describe: "Run react-server locally against an aws backend",
  builder: (yargs: Argv) => {
    return yargs
      .option("stage", { type: "string", demandOption: false })
      .option("watch", {
        type: "boolean",
        demandOption: false,
        describe: "Watch the project for changes",
      });
  },
  handler: async (options: { stage?: string; watch?: boolean }) => {
    await checkIfAuthenticated();
    const stage = options.stage || (await setStageFromBranch());
    await writeUiEnvFile(stage, true);

    if (options.watch) {
      // Integrate the watch functionality when the --watch flag is passed
      await runner.run_command_and_output(
        "CDK Watch",
        ["cdk", "watch", "-c", `stage=${stage}`, "--no-rollback"],
        ".",
      );
    } else {
      // Regular UI command execution
      await runner.run_command_and_output(
        `Build`,
        ["bun", "run", "build"],
        "react-app",
      );
      await runner.run_command_and_output(
        `Run`,
        ["bun", "run", "dev"],
        `react-app`,
      );
    }
  },
};
