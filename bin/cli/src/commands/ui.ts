import { Argv } from "yargs";

import { checkIfAuthenticated, runCommand, setStageFromBranch, writeUiEnvFile } from "../lib";

export const ui = {
  command: "ui",
  describe: "Run react-server locally against an aws backend",
  builder: (yargs: Argv) => {
    return yargs
      .option("stage", { type: "string", demandOption: false })
      .option("mocked", { type: "boolean", demandOption: false, default: false });
  },

  handler: async (options: { stage?: string; mocked?: boolean }) => {
    if (options.mocked) {
      await runCommand("bun", ["run", "build"], "react-app");
      await runCommand(`bun`, ["run", "mocked"], "react-app");
    } else {
      await checkIfAuthenticated();
      const stage = options.stage || (await setStageFromBranch());

      await writeUiEnvFile(stage, true);
      await runCommand("bun", ["run", "build"], "react-app");
      await runCommand(`bun`, ["run", "dev"], "react-app");
    }
  },
};
