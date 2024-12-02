import { Authority, EmailAddresses, Events, CommonEmailVariables } from "shared-types";
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

export const respondToRai: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    cms: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Medicaid SPA RAI Response for ${variables.id} Submitted`,
        body: await render(<MedSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Your Medicaid SPA RAI Response for ${variables.id} has been submitted to CMS`,
        body: await render(<MedSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.chipInbox,
          ...variables.emails.srtEmails,
          ...variables.emails.cpocEmail,
        ],
        cc: variables.emails.chipCcList,
        subject: `CHIP SPA RAI Response for ${variables.id} Submitted`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Your CHIP SPA RAI Response for ${variables.id} has been submitted to CMS`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.dmcoEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Waiver RAI Response for ${variables.id} Submitted`,
        body: await render(<WaiverCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        cc: variables.allStateUsersEmails,
        subject: `Your 1915(b) RAI Response for ${variables.id} has been submitted to CMS`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915c"]]: {
    cms: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.dmcoEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Waiver RAI Response for ${variables.id} Submitted`,
        body: await render(<WaiverCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        cc: variables.allStateUsersEmails,
        subject: `Your 1915(c) RAI Response for ${variables.id} has been submitted to CMS`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
};
