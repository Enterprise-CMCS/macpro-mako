import { checkIfAuthenticated, runCommand } from "../lib";

export const emails = {
  command: "emails",
  handler: async () => {
    await checkIfAuthenticated();
    await runCommand("bun", ["email-dev"], "./lib/libs/email");
  },
};
