import { Events, Authority, CommonEmailVariables, EmailAddresses } from "shared-types";
import { Events, Authority, CommonEmailVariables, EmailAddresses } from "shared-types";
import { AuthoritiesWithUserTypesTemplate } from "../..";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  WaiverCMSEmail,
  WaiverStateEmail,
  WaiverCMSEmail,
  WaiverStateEmail,
} from "./emailTemplates";
import { render } from "@react-email/render";

export const withdrawPackage: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        cc: variables.emails.dpoEmail,
        subject: `SPA Package ${variables.id} Withdraw Request`,
        body: await render(<MedSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Medicaid SPA Package ${variables.id} Withdrawal Confirmation`,
        body: await render(<MedSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        cc: variables.emails.chipCcList,
        subject: `CHIP SPA Package ${variables.id} Withdraw Request`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
          `${variables.submitterName} <${variables.submitterEmail}>`,
        ],
        cc: variables.emails.chipCcList,
        subject: `CHIP SPA Package ${variables.id} Withdrawal Confirmation`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        subject: `Waiver Package ${variables.id} Withdraw Request`,
        body: await render(<WaiverCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`], // TODO: change to ALL state users
        subject: `Waiver Package ${variables.id} Withdraw Request`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },

  [Authority["1915c"]]: {
    cms: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Waiver Package ${variables.id} Withdraw Request`,
        body: await render(<WaiverCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`], // TODO: change to ALL state users
        subject: `Waiver Package ${variables.id} Withdraw Request`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
};
