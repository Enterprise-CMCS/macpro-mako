import { Argv } from "yargs";

import { runCommand } from "../lib/index.js";

export const docs = {
  command: "docs",
  describe:
    "Starts the Jekyll documentation site in a docker container, available on http://localhost:4000.",
  builder: (yargs: Argv) =>
    yargs.option("stop", {
      type: "boolean",
      demandOption: false,
      default: false,
    }),
  handler: async ({ stop }: { stop: boolean }) => {
    await runCommand("docker", ["rm", "-f", "jekyll"], "docs");

    if (!stop) {
      await runCommand(
        "docker",
        [
          "run",
          "--rm",
          "-i",
          "-v",
          `${process.cwd()}/docs:/site`,
          "--name",
          "jekyll",
          "--pull=always",
          "-p",
          "0.0.0.0:4000:4000",
          "bretfisher/jekyll-serve",
          "sh",
          "-c",
          "bundle install && bundle exec jekyll serve --force_polling --host 0.0.0.0",
        ],
        "docs",
      );
    }
  },
};
