import { Argv } from "yargs";

import { runCommand } from "../lib";

export const storybook = {
  command: "storybook",
  describe: "Start or build the Storybook site",
  builder: (yargs: Argv) => {
    return yargs
      .option("start-only", {
        type: "boolean",
        demandOption: false,
        default: true,
        describe: "Start the Storybook site without building",
        defaultDescription: "true",
      })
      .option("build-only", {
        type: "boolean",
        demandOption: false,
        default: false,
        describe: "Build the Storybook site without starting it",
        defaultDescription: "false",
      })
      .option("ci", {
        type: "boolean",
        demandOption: false,
        default: false,
        describe: "Start the Storybook site without opening the browser",
        defaultDescription: "false",
      });
  },

  handler: async (options: { "start-only"?: boolean; "build-only"?: boolean; ci?: boolean }) => {
    // install the playwright browser dependencies
    await runCommand(
      "bunx",
      ["playwright", "install", "--with-deps", "chromium", "--force"],
      "react-app",
    );
    // build the UI
    await runCommand("bun", ["run", "build"], "react-app");

    const storybookCommand = ["run", "storybook"];

    if (options.ci) {
      storybookCommand.push("--ci");
    }

    if (options["start-only"]) {
      await runCommand("bun", storybookCommand, "react-app");
    } else if (options["build-only"]) {
      await runCommand("bun", ["run", "build-storybook"], "react-app");
    } else {
      await runCommand("bun", ["run", "build-storybook"], "react-app");
      await runCommand("bun", storybookCommand, "react-app");
    }
  },
};
