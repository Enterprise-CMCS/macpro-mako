import { runCommand } from "../lib";

export const install = {
  command: "install",
  describe: "Install all project dependencies from the current directory.\n",
  handler: async () => {
    // CI must install exactly what the lockfile pins. Local installs stay
    // mutable so developers can add/upgrade packages without fighting the flag.
    const frozen = process.env.CI ? ["--frozen-lockfile"] : [];
    await runCommand("bun", ["install", ...frozen], ".");
    await runCommand("bun", ["install", ...frozen], "lib/attachment-archive");
  },
};
