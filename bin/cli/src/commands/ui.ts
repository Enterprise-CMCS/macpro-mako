import { Argv } from "yargs";

import {
  checkIfAuthenticated,
  runCommand,
  setStageFromBranch,
  writeMockedUiEnvFile,
  writeUiEnvFile,
} from "../lib";

export const ui = {
  command: "ui",
  describe:
    "Run the React app locally with the Stage environment as the API. \n\n** Requires MACPro Application Admin or MACPro ReadOnly AWS credentials **\n",
  builder: (yargs: Argv) => {
    return yargs
      .option("stage", {
        type: "string",
        demandOption: false,
        describe: "Stage environment in AWS",
        defaultDescription: "current branch name",
      })
      .option("mocked", {
        type: "boolean",
        demandOption: false,
        default: false,
        describe: "Use Mock Service Worker instead of the deployed API",
        defaultDescription: "false",
      })
      .option("mockedUsername", {
        alias: "u",
        type: "string",
        demandOption: false,
        default: "cd400c39-9e7c-4341-b62f-234e2ecb339d", // TEST_STATE_SUBMITTER_USERNAME can't currently import from mocks into cli, once that is fixed we can use the variable
        describe: "Username of mock user to login as",
        defaultDescription: "Test State Submitter",
      });
  },

  handler: async (options: { stage?: string; mocked?: boolean; mockedUsername?: string }) => {
    if (options.mocked) {
      await writeMockedUiEnvFile(options.mockedUsername);
      await runCommand(`bun`, ["run", "mocked"], "react-app");
    } else {
      await checkIfAuthenticated();
      const stage = options.stage || (await setStageFromBranch());

      await writeUiEnvFile(stage, true);
      await runCommand("bun", ["run", "build"], "react-app");
      await runCommand(`bun`, ["run", "dev"], "react-app");
    }
  },
};
