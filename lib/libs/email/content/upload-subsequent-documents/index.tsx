import { Events, Authority, EmailAddresses, CommonEmailVariables } from "shared-types";
import { AuthoritiesWithUserTypesTemplate } from "../..";
import { ChipSpaCMSEmail, ChipSpaStateEmail } from "./emailTemplates";
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
};
