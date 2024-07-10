import { SecurityHubJiraSync } from "@enterprise-cmcs/macpro-security-hub-sync";

export const securityHubSync = {
  command: ["securityHubJiraSync", "securityHubSync", "secHubSync"],
  describe: "Create Jira Issues for Security Hub findings.",
  handler: async () => {
    await new SecurityHubJiraSync({
      customJiraFields: {
        customfield_14117: [{ value: "Platform Team" }],
        customfield_14151: [{ value: "Not Applicable " }],
        customfield_14068:
          "* All findings of this type are resolved or suppressed, indicated by a Workflow Status of Resolved or Suppressed.  (Note:  this ticket will automatically close when the AC is met.)",
      },
    }).sync();
  },
};
