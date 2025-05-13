import { MedSpaStateEmail } from "../../../content/withdrawConfirmation/emailTemplates";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";

export default () => {
  return (
    <MedSpaStateEmail
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
