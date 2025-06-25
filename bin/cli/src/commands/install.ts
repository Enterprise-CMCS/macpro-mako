import { runCommand } from "../lib";

export const install = {
  command: "install",
  describe: "Install all project dependencies from the current directory.\n",
  handler: async () => {
    await runCommand("bun", ["install"], ".");
  },
};
