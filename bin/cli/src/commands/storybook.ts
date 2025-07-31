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
      });
  },

  handler: async (options: { "start-only"?: boolean; "build-only"?: boolean }) => {
    if (options["start-only"]) {
      await runCommand("bun", ["run", "storybook"], "react-app");
    } else if (options["build-only"]) {
      await runCommand("bun", ["run", "build-storybook"], "react-app");
    } else {
      await runCommand("bun", ["run", "build-storybook"], "react-app");
      await runCommand("bun", ["run", "storybook"], "react-app");
    }
  },
};
