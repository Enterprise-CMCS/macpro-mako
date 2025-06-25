// import { TEST_REVIEWER_USERNAME, TEST_STATE_SUBMITTER_USERNAME, usernamesByEmail } from "mocks";
// import prompts from "prompts";
import { Argv } from "yargs";

// import { runCommand, writeUiEnvMockedApiFile } from "../lib/index.js";
import { runCommand } from "../lib/index.js";

export const uiLocalOnly = {
  command: "ui-local-only",
  describe: "Run the React app locally with Mock Service worker as the API.",
  builder: (yargs: Argv) => {
    return yargs
      .option("statesubmitter", {
        type: "boolean",
        demandOption: false,
        default: false,
        description: "Login as a State Submitter",
        defaultDescription: "false",
      })
      .option("reviewer", {
        type: "boolean",
        demandOption: false,
        default: false,
        description: "Login as a CMS Reviewer",
        defaultDescription: "false",
      })
      .option("userId", {
        type: "string",
        demandOption: false,
        describe: "User to login as",
      })
      .check((argv) => {
        if (argv.statesubmitter && argv.reviewer) {
          throw new Error("You cannot user both --statesubmitter and --reviewer at the same time.");
        }
        if (argv.statesubmitter && argv.userId) {
          throw new Error("You cannot user both --statesubmitter and --userId at the same time.");
        }
        if (argv.reviewer && argv.userId) {
          throw new Error("You cannot user both --reviewer and --userId at the same time.");
        }
        return true;
      });
  },

  handler: async (options: { statesubmitter?: boolean; reviewer?: boolean; userId?: string }) => {
    console.log({ options });
    // handler: async (options: { statesubmitter?: boolean; reviewer?: boolean; userId?: string }) => {
    // let userId;
    // if (options.statesubmitter) {
    //   userId = TEST_STATE_SUBMITTER_USERNAME;
    // } else if (options.reviewer) {
    //   userId = TEST_REVIEWER_USERNAME;
    // } else if (options.userId) {
    //   userId = options.userId;
    // } else {
    //   const response = await prompts({
    //     type: "select",
    //     name: "selectedUsername",
    //     message: "Which user do you want to be logged in as?",
    //     choices: Object.entries(usernamesByEmail).map(([email, username]) => ({
    //       title: email,
    //       value: username,
    //     })),
    //   });
    //   userId = response.selectedUsername;
    // }

    // await writeUiEnvMockedApiFile(userId);
    await runCommand("bun", ["run", "build"], "react-app");
    await runCommand(`bun`, ["run", "mocked"], "react-app");
  },
};
