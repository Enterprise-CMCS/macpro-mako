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
        subject: `New CHIP SPA ${variables.id} Submitted`,
        body: await render(<ChipSpaCMSEmail variables={variables} />),
      };
    },
    state: async (
      variables: Events["UploadSubsequentDocuments"] &
        CommonEmailVariables & { emails: EmailAddresses },
    ) => {
      return {
        to: [`${variables.submitterName} <${variables.submitterEmail}>`],
        subject: `Your CHIP SPA ${variables.id} has been submitted to CMS`,
        body: await render(<ChipSpaStateEmail variables={variables} />),
      };
    },
  },
};
