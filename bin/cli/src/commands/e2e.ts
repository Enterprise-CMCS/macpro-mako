import { Argv } from "yargs";
import { LabeledProcessRunner } from "../lib";

const runner = new LabeledProcessRunner();

export const e2e = {
  command: "e2e",
  describe: "run e2e tests.",
  builder: (yargs: Argv) =>
    yargs.option("ui", {
      type: "boolean",
      demandOption: false,
      default: false,
    }),
  handler: async ({ ui }: { ui: boolean }) => {
    await runner.run_command_and_output(
      "Install playwright",
      ["bun", "playwright", "install", "--with-deps"],
      ".",
    );

    await runner.run_command_and_output(
      ui ? "e2e:ui tests" : "e2e tests",
      ["bun", ui ? "e2e:ui" : "e2e"],
      ".",
    );
  },
};
