import { Argv } from "yargs";
import {
  checkIfAuthenticated,
  runCommand,
  setStageFromBranch,
  writeUiEnvFile,
} from "../lib";

export const ui = {
  command: "ui",
  describe: "Run react-server locally against an aws backend",
  builder: (yargs: Argv) => {
    return yargs
      .option("stage", { type: "string", demandOption: false })
      .option("watch", {
        type: "boolean",
        demandOption: false,
        default: false,
        describe: "Watch the project for changes",
      });
  },

  handler: async (options: { stage?: string; watch: boolean }) => {
    await checkIfAuthenticated();
    const stage = options.stage || await setStageFromBranch();

    await writeUiEnvFile(stage, true);
    if (options.watch) {
      // Integrate the watch functionality when the --watch flag is passed
      await runCommand(
        "CDK Watch",
        ["cdk", "watch", "-c", `stage=${stage}`, "--no-rollback"],
        ".",
      );
    } else {
      // Regular UI command execution
      await runCommand(`Build`, ["bun", "run", "build"], "react-app");
      await runCommand(`Run`, ["bun", "run", "dev"], `react-app`);
    }
  },
};
