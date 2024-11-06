import { Authority, CommonEmailVariables, EmailAddresses, WithdrawPackage } from "shared-types";
import { AuthoritiesWithUserTypesTemplate } from "../..";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
} from "./emailTemplates";
import { render } from "@react-email/render";
import { getToAddress } from "../email-components";

export const withdrawPackage: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (variables: WithdrawPackage & CommonEmailVariables & { emails: EmailAddresses }) => {
      return {
        to: variables.emails.osgEmail,
        cc: variables.emails.dpoEmail,
        subject: `SPA Package ${variables.id} Withdraw Request`,
        body: await render(<MedSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: WithdrawPackage & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: getToAddress({
          name: variables.submitterName,
          email: variables.submitterEmail,
        }),
        subject: `Medicaid SPA Package ${variables.id} Withdrawal Confirmation`,
        body: await render(<MedSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (variables: WithdrawPackage & CommonEmailVariables & { emails: EmailAddresses }) => {
      return {
        to: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        cc: variables.emails.chipCcList,
        subject: `CHIP SPA Package ${variables.id} Withdraw Request`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: WithdrawPackage & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        cc: variables.emails.chipCcList,
        subject: `CHIP SPA Package ${variables.id} Withdrawal Confirmation`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
      };
    },
  },
};
