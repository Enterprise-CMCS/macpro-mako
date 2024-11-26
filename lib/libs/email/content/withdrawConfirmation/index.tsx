import { Authority, CommonEmailVariables, EmailAddresses } from "shared-types";
import { AuthoritiesWithUserTypesTemplate } from "../..";
import { WaiverStateEmail } from "./emailTemplates";
import { render } from "@react-email/render";

export const withdrawConfirmation: AuthoritiesWithUserTypesTemplate = {
  [Authority["1915b"]]: {
    state: async (variables: any & CommonEmailVariables & { emails: EmailAddresses }) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`], // TODO: change to all state users
        subject: `1915(b) ${variables.id} Withdrawal Confirmation`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915c"]]: {
    state: async (variables: any & CommonEmailVariables & { emails: EmailAddresses }) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`], // TODO: change to all state users
        subject: `1915(c) ${variables.id} Withdrawal Confirmation`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
  //   TODO: add CHIP & SPA Withdraw Confirmation Here
};
