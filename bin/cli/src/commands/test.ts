import { Argv } from "yargs";

import { runCommand } from "../lib";

export const test = {
  command: "test",
  describe: "Run the unit tests.\n",
  builder: (yargs: Argv) => {
    return yargs
      .option("coverage", {
        type: "boolean",
        describe: "Generate a coverage report",
      })
      .option("ui", {
        type: "boolean",
        describe: "Run the tests in the Vitest UI view",
      })
      .check((argv) => {
        if (argv.coverage && argv.ui) {
          throw new Error("You cannot use both --watch and --ui at the same time.");
        }
        return true;
      });
  },
  handler: async (argv) => {
    let testCommand = "test";
    if (argv.coverage) {
      testCommand = "test:coverage";
    }
    if (argv.ui) {
      testCommand = "test:ui";
    }
    await runCommand("bun", ["run", testCommand], ".");
  },
};
