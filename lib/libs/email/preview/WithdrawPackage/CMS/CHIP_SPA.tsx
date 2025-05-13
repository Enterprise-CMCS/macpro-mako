import { ChipSpaCMSEmail } from "../../../content/withdrawPackage/emailTemplates";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";

export default () => {
  return (
    <ChipSpaCMSEmail
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
