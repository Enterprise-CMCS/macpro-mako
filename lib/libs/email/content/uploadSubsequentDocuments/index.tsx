import { render } from "@react-email/render";
import { Authority, CommonEmailVariables, EmailAddresses, Events } from "shared-types";

import { AuthoritiesWithUserTypesTemplate } from "../..";
import {
  AppKCMSEmail,
  AppKStateEmail,
  ChipSpaCMSEmail,
  ChipSpaStateEmail,
  MedSpaCMSEmail,
  MedSpaStateEmail,
  WaiversEmailCMS,
  WaiversEmailState,
} from "./emailTemplates";

export const uploadSubsequentDocuments: AuthoritiesWithUserTypesTemplate = {
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        subject: `Action required: review new documents for ${variables.authority} ${variables.id}`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Additional documents submitted for ${variables.authority} ${variables.id}`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority.MED_SPA]: {
    cms: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        subject: `Action required: review new documents for ${variables.authority} ${variables.id}`,
        body: await render(<MedSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Additional documents submitted for ${variables.authority} ${variables.id}`,
        body: await render(<MedSpaStateEmail variables={variables} />),
      };
    },
  },
  [Authority["1915b"]]: {
    cms: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [...variables.emails.cpocEmail, ...variables.emails.srtEmails],
        subject: `Action required: review new documents for 1915(b) ${variables.actionType} Waiver ${variables.id}`,
        body: await render(<WaiversEmailCMS variables={variables} />),
      };
    },
    state: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Additional documents submitted for 1915(b) ${variables.actionType} Waiver ${variables.id}`,
        body: await render(<WaiversEmailState variables={variables} />),
      };
    },
  },
  [Authority["1915c"]]: {
    cms: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [
          ...variables.emails.osgEmail,
          ...variables.emails.cpocEmail,
          ...variables.emails.srtEmails,
        ],
        subject: `Action required: review new documents for 1915(c) ${variables.actionType} Waiver ${variables.id}`,
        body: await render(<AppKCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Additional documents submitted for 1915(c) ${variables.actionType} Waiver ${variables.id}`,
        body: await render(<AppKStateEmail variables={variables} />),
      };
    },
  },
};
