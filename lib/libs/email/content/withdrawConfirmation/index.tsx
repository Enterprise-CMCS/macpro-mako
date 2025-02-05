import { Authority, CommonEmailVariables, EmailAddresses, Events } from "shared-types";
import { AuthoritiesWithUserTypesTemplate } from "../..";
import { ChipSpaStateEmail, MedSpaStateEmail, WaiverStateEmail } from "./emailTemplates";
import { render } from "@react-email/render";

export const withdrawConfirmation: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Medicaid SPA Package ${variables.id} Withdrawal Confirmation`,
        body: await render(<MedSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `CHIP SPA Package ${variables.id} Withdraw Confirmation`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915b"]]: {
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `1915(b) ${variables.id} Withdrawal Confirmation`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915c"]]: {
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `1915(c) ${variables.id} Withdrawal Confirmation`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
};
