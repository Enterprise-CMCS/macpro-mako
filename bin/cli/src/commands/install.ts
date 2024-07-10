import { LabeledProcessRunner } from "../lib";

const runner = new LabeledProcessRunner();

export const install = {
  command: "install",
  describe: "install all project dependencies",
  handler: async () => {
    await runner.run_command_and_output("Install", ["yarn"], ".", true);
  },
};
