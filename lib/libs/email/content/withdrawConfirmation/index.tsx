import { render } from "@react-email/render";
import { Authority, CommonEmailVariables, EmailAddresses, Events } from "shared-types";

import { AuthoritiesWithUserTypesTemplate } from "../../index";
import { ChipSpaStateEmail, MedSpaStateEmail, WaiverStateEmail } from "./emailTemplates";

const generateWithdrawEmail = async (
  variables: Events["WithdrawPackage"] & CommonEmailVariables & { emails: EmailAddresses },
  subjectPrefix: string,
  EmailComponent: React.FC<{ variables: any }>,
) => {
  return {
    to: variables.allStateUsersEmails?.length
      ? variables.allStateUsersEmails
      : [`${variables.submitterName} <${variables.submitterEmail}>`],
    subject: `${subjectPrefix} ${variables.id} Withdrawal Confirmation`,
    body: await render(<EmailComponent variables={variables} />),
  };
};

export const withdrawConfirmation: AuthoritiesWithUserTypesTemplate = {
  [Authority.MED_SPA]: {
    state: (variables) =>
      generateWithdrawEmail(variables, "Medicaid SPA Package", MedSpaStateEmail),
  },
  [Authority.CHIP_SPA]: {
    state: (variables) => {
      const chipPrefix = `CHIP${variables.isChipEligibility ? " Eligibility" : ""}`;

      return generateWithdrawEmail(variables, `${chipPrefix} SPA Package`, ChipSpaStateEmail);
    },
  },
  [Authority["1915b"]]: {
    state: (variables) => generateWithdrawEmail(variables, "1915(b)", WaiverStateEmail),
  },
  [Authority["1915c"]]: {
    state: (variables) => generateWithdrawEmail(variables, "1915(c)", WaiverStateEmail),
  },
};
