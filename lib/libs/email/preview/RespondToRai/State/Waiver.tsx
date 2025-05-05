import { formatActionType } from "shared-utils";

import { WaiverStateEmail } from "../../../content/respondToRai/emailTemplates";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/respond-to-rai";

export default () => {
  return (
    <WaiverStateEmail
      variables={{
        ...emailTemplateValue,
        event: "respond-to-rai",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: formatActionType("Amend"),
        territory: "CO",
        attachments: {
          revisedAmendedStatePlanLanguage: attachments.other,
          officialRAIResponse: attachments.other,
          budgetDocuments: attachments.budgetDocuments,
          publicNotice: attachments.publicNotice,
          tribalConsultation: attachments.tribalConsultation,
          other: attachments.other,
        },
      }}
    />
  );
};
