import { Events, Authority, EmailAddresses, CommonEmailVariables } from "shared-types";
import { AuthoritiesWithUserTypesTemplate } from "../..";
import { ChipSpaCMSEmail, ChipSpaStateEmail, AppKCMSEmail, AppKStateEmail } from "./emailTemplates";
import { render } from "@react-email/render";

export const uploadSubsequentDocuments: AuthoritiesWithUserTypesTemplate = {
  [Authority.CHIP_SPA]: {
    cms: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: variables.emails.chipInbox,
        cc: variables.emails.chipCcList,
        subject: `Action required: review new documents for ${variables.actionType + variables.id}`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Additional documents submitted for ${variables.actionType + variables.id}`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
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
        subject: `Action required: review new documents for ${variables.actionType + variables.id}`,
        body: await render(<AppKCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Additional documents submitted for ${variables.actionType + variables.id}`,
        body: await render(<AppKStateEmail variables={variables} />),
      };
    },
  },
};
