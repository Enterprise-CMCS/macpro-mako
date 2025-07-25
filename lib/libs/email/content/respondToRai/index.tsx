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
        to: [
          `${variables.submitterName} <${variables.submitterEmail}>`,
          // Prevent submitter from being added twice:
          ...(variables.allStateUsersEmails ?? []).filter(
            (email) => !email.includes(variables.submitterEmail),
          ),
        ],
        subject: `Your Medicaid SPA RAI Response for ${variables.id} has been submitted to CMS`,
        body: await render(<MedSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      const chipPrefix = `CHIP${variables.isChipEligibility ? " Eligibility" : ""}`;

      return {
        to: [
          ...variables.emails.chipInbox,
          ...variables.emails.srtEmails,
          ...variables.emails.cpocEmail,
        ],
        cc: variables.emails.chipCcList,
        subject: `${chipPrefix} SPA RAI Response for ${variables.id} Submitted`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["RespondToRai"] & CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      const chipPrefix = `CHIP${variables.isChipEligibility ? " Eligibility" : ""}`;

      return {
        to: [
          `${variables.submitterName} <${variables.submitterEmail}>`,
          // Prevent submitter from being added twice:
          ...(variables.allStateUsersEmails ?? []).filter(
            (email) => !email.includes(variables.submitterEmail),
          ),
        ],
        subject: `Your ${chipPrefix} SPA RAI Response for ${variables.id} has been submitted to CMS`,
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
        to: [
          `${variables.submitterName} <${variables.submitterEmail}>`,
          // Prevent submitter from being added twice:
          ...(variables.allStateUsersEmails ?? []).filter(
            (email) => !email.includes(variables.submitterEmail),
          ),
        ],
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
        to: [
          `${variables.submitterName} <${variables.submitterEmail}>`,
          // Prevent submitter from being added twice:
          ...(variables.allStateUsersEmails ?? []).filter(
            (email) => !email.includes(variables.submitterEmail),
          ),
        ],
        subject: `Your 1915(c) RAI Response for ${variables.id} has been submitted to CMS`,
        body: await render(<WaiverStateEmail variables={variables} />),
      };
    },
  },
};
