import { formatActionType } from "shared-utils";

import { WaiverStateEmail } from "../../../content/withdrawPackage/emailTemplates";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";

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
