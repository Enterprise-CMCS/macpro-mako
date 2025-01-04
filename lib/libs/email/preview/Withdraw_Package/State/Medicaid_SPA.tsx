import { MedSpaStateEmail } from "../../../content/withdrawPackage/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <MedSpaStateEmail
      variables={{
        ...emailTemplateValue,
        authority: "Medicaid SPA",
        event: "withdraw-package",
        id: "CO-1234.R21.00",
        actionType: "New",
        attachments: {
          officialWithdrawalLetter: attachments.withdrawRequest,
          supportingDocumentation: attachments.supportingDocumentation,
        },
      }}
    />
  );
};
