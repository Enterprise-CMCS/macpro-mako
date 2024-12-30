import { ChipSpaStateEmail } from "lib/libs/email/content/withdrawPackage/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/new-submission";
import * as attachments from "lib/libs/email/mock-data/attachments";

export default () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        authority: "CHIP SPA",
        event: "withdraw-package",
        id: "CO-1234.R21.00",
        actionType: "",
        attachments: {
          officialWithdrawalLetter: attachments.withdrawRequest,
          supportingDocumentation: attachments.supportingDocumentation,
        },
      }}
    />
  );
};
