import { CommonEmailVariables, EmailAddresses, Events, Authority } from "shared-types";
import { AuthoritiesWithUserTypesTemplate } from "../..";
import {
  MedSpaCMSEmail,
  MedSpaStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  WaiverCMSEmail,
  WaiverStateEmail,
} from "./emailTemplates";
import { render } from "@react-email/render";

export const withdrawRai: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.osgEmail,
        cc: variables.emails.dpoEmail,
        subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
        body: await render(<MedSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Withdraw Formal RAI Response for SPA Package ${variables.id}`,
        body: await render(<MedSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        cc: variables.emails.chipCcList,
        subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
          `${variables.submitterName} <${variables.submitterEmail}>`,
        ],
        cc: variables.emails.chipCcList,
        subject: `Withdraw Formal RAI Response for CHIP SPA Package ${variables.id}`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.dmcoEmail,
          ...variables.emails.osgEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
        body: await render(<WaiverCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915c"]]: {
    cms: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
        body: await render(<WaiverCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.allStateUsersEmails?.length
          ? variables.allStateUsersEmails
          : [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Withdraw Formal RAI Response for Waiver Package ${variables.id}`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
};
