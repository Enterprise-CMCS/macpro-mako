import { Argv } from "yargs";
import {
  checkIfAuthenticated,
  LabeledProcessRunner,
  writeUiEnvFile,
} from "../lib";

const runner = new LabeledProcessRunner();

export const ui = {
  command: "ui",
  describe: "Run react-server locally against an aws backend",
  builder: (yargs: Argv) => {
    return yargs.option("stage", { type: "string", demandOption: true });
  },
  handler: async (options: { stage: string }) => {
    await checkIfAuthenticated();
    await writeUiEnvFile(options.stage, true);
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
  },
};
