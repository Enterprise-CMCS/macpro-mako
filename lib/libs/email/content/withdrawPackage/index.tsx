import { render } from "@react-email/render";
import { Authority, CommonEmailVariables, EmailAddresses, Events } from "shared-types";

import { AuthoritiesWithUserTypesTemplate } from "../../index";
import {
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  MedSpaCMSEmail,
  MedSpaStateEmail,
  WaiverCMSEmail,
  WaiverStateEmail,
} from "./emailTemplates";

export const withdrawPackage: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        cc: variables.emails.dpoEmail,
        subject: `SPA Package ${variables.id} Withdraw Requested`,
        body: await render(<MedSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `SPA Package ${variables.id} Withdraw Requested`,
        body: await render(<MedSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.chipInbox,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        cc: variables.emails.chipCcList,
        subject: `CHIP SPA Package ${variables.id} Withdraw Requested`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `CHIP SPA Package ${variables.id} Withdraw Requested`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Waiver Package ${variables.id} Withdraw Requested`,
        body: await render(<WaiverCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Waiver Package ${variables.id} Withdraw Requested`,
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
        subject: `Waiver Package ${variables.id} Withdraw Requested`,
        body: await render(<WaiverCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Waiver Package ${variables.id} Withdraw Requested`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
};
