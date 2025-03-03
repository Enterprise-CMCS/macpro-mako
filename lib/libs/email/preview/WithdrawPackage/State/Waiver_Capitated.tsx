import { WaiverStateEmail } from "libs/email/content/withdrawPackage/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";
import { formatActionType } from "shared-utils";

export default () => {
  return (
    <WaiverStateEmail
      variables={{
        ...emailTemplateValue,
        authority: "1915(b)",
        event: "withdraw-package",
        id: "CO-1234.R21.00",
        actionType: formatActionType("Amend", true),
        attachments: {
          officialWithdrawalLetter: attachments.withdrawRequest,
          supportingDocumentation: attachments.supportingDocumentation,
        },
      }}
    />
  );
};
