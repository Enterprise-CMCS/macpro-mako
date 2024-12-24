import { WaiverCMSEmail } from "../../../content/withdrawPackage/emailTemplates/WaiverCMS";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <WaiverCMSEmail
      variables={{
        ...emailTemplateValue,
        authority: "1915(b)",
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
