import { WaiverStateEmail } from "libs/email/content/WithdrawRai/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/withdraw-rai";
import * as attachments from "libs/email/mock-data/attachments";

export default () => {
  return (
    <WaiverStateEmail
      variables={{
        ...emailTemplateValue,
        event: "withdraw-rai",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        attachments: {
          supportingDocumentation: attachments.supportingDocumentation,
        },
      }}
    />
  );
};
