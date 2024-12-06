import { Argv } from "yargs";
import { checkIfAuthenticated, runCommand, setStageFromBranch, writeUiEnvFile } from "../lib";

export const ui = {
  command: "ui",
  describe: "Run react-server locally against an aws backend",
  builder: (yargs: Argv) => {
    return yargs.option("stage", { type: "string", demandOption: false });
  },

  handler: async (options: { stage?: string }) => {
    await checkIfAuthenticated();
    const stage = options.stage || (await setStageFromBranch());

    await writeUiEnvFile(stage, true);
    await runCommand("bun", ["run", "build"], "react-app");
    await runCommand(`bun`, ["run", "dev"], "react-app");
  },
};
