import { runCommand } from "../lib";

export const install = {
  command: "install",
  describe: "install all project dependencies",
  handler: async () => {
    await runCommand("bun", ["install"], ".");
  },
};
