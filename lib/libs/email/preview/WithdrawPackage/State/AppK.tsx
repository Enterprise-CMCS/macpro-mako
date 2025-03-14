import { WaiverStateEmail } from "libs/email/content/withdrawPackage/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/new-submission";
import { formatActionType } from "shared-utils";

import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <WaiverStateEmail
      variables={{
        ...emailTemplateValue,
        authority: "1915(c)",
        event: "withdraw-package",
        id: "CO-1234.R21.00",
        actionType: formatActionType("Amend"),
        attachments: {
          officialWithdrawalLetter: attachments.withdrawRequest,
          supportingDocumentation: attachments.supportingDocumentation,
        },
      }}
    />
  );
};
