import { WaiverStateEmail } from "../../../content/withdrawConfirmation/emailTemplates/WaiverState";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <WaiverStateEmail
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
