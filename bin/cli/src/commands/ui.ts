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
    const stage = options.stage || (await setStageFromBranch());

    await writeUiEnvFile(stage, true);
    if (options.watch) {
      // Run both commands simultaneously using the ui:watch script
      console.log("Running CDK watch and Bun dev commands simultaneously...");
      process.env.STAGE = stage;
      await runCommand("bun", ["run", "ui:watch"], ".");
    } else {
      // Regular UI command execution
      await runCommand(`bun`, ["run", "dev"], "react-app");
    }
  },
};
