import { Argv } from "yargs";
import { LabeledProcessRunner, writeUiEnvFile } from "../lib";

const runner = new LabeledProcessRunner();

export const ui = {
  command: "ui",
  describe: "Run react-server locally against an aws backend",
  builder: (yargs: Argv) => {
    return yargs.option("stage", { type: "string", demandOption: true });
  },
  handler: async (options: { stage: string }) => {
    await writeUiEnvFile(options.stage, true);
    await runner.run_command_and_output(
      `Build`,
      ["yarn", "build"],
      "react-app",
    );
    await runner.run_command_and_output(`Run`, ["yarn", "dev"], `react-app`);
  },
};
