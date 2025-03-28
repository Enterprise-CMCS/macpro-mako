import { Argv } from "yargs";

import { runCommand } from "../lib";

export const test = {
  command: "test",
  describe: "run all available tests.",
  builder: (yargs: Argv) => {
    return yargs
      .option("coverage", {
        type: "boolean",
        describe: "Run tests and generate a coverage report.",
      })
      .option("ui", {
        type: "boolean",
        describe: "Run tests with Vitest UI",
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
