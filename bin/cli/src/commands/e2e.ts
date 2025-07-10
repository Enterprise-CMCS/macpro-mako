import { Argv } from "yargs";

import { checkIfAuthenticated, runCommand } from "../lib";

export const e2e = {
  command: "e2e",
  describe:
    "Run the Playwright tests. \n\n** Requires MACPro Application Admin AWS credentials **\n",
  builder: (yargs: Argv) =>
    yargs.option("ui", {
      type: "boolean",
      demandOption: false,
      default: false,
      describe: "Run the tests in the Playwright UI view",
      defaultDescription: "false",
    }),
  handler: async ({ ui }: { ui: boolean }) => {
    await checkIfAuthenticated();
    console.log(ui);
    await runCommand("bun", ["playwright", "install", "--with-deps", "chromium"], ".");

    // await runCommand("bun", [ui ? "e2e:ui" : "e2e", "--", "--", "--grep", "@CI"], ".");

    await runCommand("bun", [ui ? "e2e:ui" : "e2e"], ".");
  },
};
