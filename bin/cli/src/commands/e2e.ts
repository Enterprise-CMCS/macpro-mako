import { Argv } from "yargs";
import { checkIfAuthenticated, runCommand } from "../lib";

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
    await checkIfAuthenticated();
    console.log(ui);
    await runCommand("bun", ["playwright", "install", "--with-deps", "chromium"], ".");

    await runCommand("turbo", ["telemetry", "disable"], ".")
    await runCommand("turbo", [ui ? "e2e:ui" : "e2e", "-vvv"], ".");
  },
};
