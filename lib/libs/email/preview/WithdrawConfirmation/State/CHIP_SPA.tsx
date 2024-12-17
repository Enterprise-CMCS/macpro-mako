import { ChipSpaStateEmail } from "lib/libs/email/content/withdrawConfirmation/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        event: "withdraw-package",
        id: "CO-1234.R21.00",
        authority: "1915(b)",
        actionType: "Amend",
        territory: "CO",
        attachments: {
          officialWithdrawalLetter: attachments.withdrawRequest,
          supportingDocumentation: attachments.supportingDocumentation,
        },
      }}
    />
  );
};
