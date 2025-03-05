import { WaiverStateEmail } from "libs/email/content/respondToRai/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/respond-to-rai";
import * as attachments from "libs/email/mock-data/attachments";
import { formatActionType } from "shared-utils";

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
