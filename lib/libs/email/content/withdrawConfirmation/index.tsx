import {
  Authority,
  CommonEmailVariables,
  EmailAddresses,
  Events,
  SEATOOL_STATUS,
} from "shared-types";
import { AuthoritiesWithUserTypesTemplate, EmailTemplate } from "../..";
import { ChipSpaStateEmail, MedSpaStateEmail, WaiverStateEmail } from "./emailTemplates";
import { render } from "@react-email/render";

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
      variables.seatoolStatus === SEATOOL_STATUS.WITHDRAWN
        ? generateWithdrawEmail(variables, "Medicaid SPA Package", MedSpaStateEmail)
        : Promise.resolve(null as unknown as EmailTemplate),
  },
  [Authority.CHIP_SPA]: {
    state: (variables) =>
      variables.seatoolStatus === SEATOOL_STATUS.WITHDRAWN
        ? generateWithdrawEmail(variables, "CHIP SPA Package", ChipSpaStateEmail)
        : Promise.resolve(null as unknown as EmailTemplate),
  },
  [Authority["1915b"]]: {
    state: (variables) =>
      variables.seatoolStatus === SEATOOL_STATUS.WITHDRAWN
        ? generateWithdrawEmail(variables, "1915(b)", WaiverStateEmail)
        : Promise.resolve(null as unknown as EmailTemplate),
  },
  [Authority["1915c"]]: {
    state: (variables) =>
      variables.seatoolStatus === SEATOOL_STATUS.WITHDRAWN
        ? generateWithdrawEmail(variables, "1915(c)", WaiverStateEmail)
        : Promise.resolve(null as unknown as EmailTemplate),
  },
};
