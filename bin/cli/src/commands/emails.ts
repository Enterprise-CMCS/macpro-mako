import { checkIfAuthenticated, runCommand } from "../lib";

export const emails = {
  command: "emails",
  describe:
    "Start the development server for working with the email templates. \n\n** Requires MACPro Application Admin or MACPro ReadOnly AWS credentials **\n",
  handler: async () => {
    await checkIfAuthenticated();
    await runCommand("bun", ["email-dev"], "./lib/libs/email");
  },
};
