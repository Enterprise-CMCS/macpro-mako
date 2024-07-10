import { LabeledProcessRunner } from "../lib";

const runner = new LabeledProcessRunner();

export const testGui = {
  command: "test-gui",
  describe: "open unit-testing gui for vitest.",
  handler: async () => {
    await runner.run_command_and_output(
      "Unit Tests",
      ["yarn", "test-gui"],
      ".",
    );
  },
};
