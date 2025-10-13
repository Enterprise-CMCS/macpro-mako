/**
 * Test CLI command example usage:
 *
 * Run all tests:
 *   ./run test
 *
 * Run tests with coverage:
 *   ./run test --coverage
 *
 * Run tests in UI mode:
 *   ./run test --ui
 *
 * Run Storybook tests:
 *   ./run test --storybook
 *
 * Run tests without watch mode:
 *   ./run test --run
 *
 * Run specific test files or filters:
 *   ./run test --run getReportUrl
 *   ./run test --run lib/lambda/getReportUrl.test.ts
 *
 * Run tests matching a specific name pattern (accepts vitest patterns):
 *   ./run test --run -t "should return 400"
 *
 */
import { Argv } from "yargs";

import { runCommand } from "../lib";

export const test = {
  command: "test [filters..]",
  describe:
    "Run the unit tests.\n\nYou can pass additional vitest arguments like file filters:\n  ./run test getReportUrl\n  ./run test --run lib/lambda/getReportUrl.test.ts\n",
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
      .option("storybook", {
        type: "boolean",
        describe: "Run the Storybook tests",
      })
      .option("run", {
        type: "boolean",
        describe: "Run tests without watch mode",
      })
      .parserConfiguration({
        "unknown-options-as-args": true,
      })
      .check((argv) => {
        if (
          (argv.coverage && argv.ui) ||
          (argv.coverage && argv.storybook) ||
          (argv.ui && argv.storybook)
        ) {
          throw new Error("You cannot use both --watch and --ui at the same time.");
        }
        return true;
      });
  },
  handler: async (argv: any) => {
    let testCommand = "test";
    const additionalArgs: string[] = [];

    // Handle specific flags
    if (argv.coverage) {
      testCommand = "test:coverage";
    }
    if (argv.ui) {
      testCommand = "test:ui";
    }
    if (argv.run) {
      additionalArgs.push("--run");
    }

    // Add any filters or additional arguments
    if (argv.filters && argv.filters.length > 0) {
      additionalArgs.push(...argv.filters);
    }

    // Add any unknown arguments (passed through by yargs)
    if (argv._ && argv._.length > 1) {
      // Skip the first argument which is the command name 'test'
      additionalArgs.push(...argv._.slice(1));
    }

    if (argv.storybook) {
      testCommand = "test:storybook";
      // install the playwright browser dependencies
      await runCommand(
        "bunx",
        ["playwright", "install", "--with-deps", "chromium", "--force"],
        "react-app",
      );
      // build the UI
      await runCommand("bun", ["run", "build"], "react-app");
    }

    // Build the complete command
    const commandArgs = ["run", testCommand, ...additionalArgs];
    await runCommand("bun", commandArgs, ".");
  },
};
