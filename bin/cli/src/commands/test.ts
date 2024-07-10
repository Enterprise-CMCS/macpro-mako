import { Argv } from "yargs";
import { LabeledProcessRunner } from "../lib";

const runner = new LabeledProcessRunner();

export const test = {
  command: "test",
  describe: "run all available tests.",
  builder: (yargs: Argv) => {
    return yargs.option("stage", { type: "string", demandOption: true });
  },
  handler: async (options: { stage: string }) => {
    await runner.run_command_and_output(
      "Load test data",
      ["sls", "database", "seed", "--stage", options.stage],
      ".",
    );
  },
};
