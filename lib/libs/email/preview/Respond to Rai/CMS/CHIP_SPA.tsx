import { ChipSpaCMSEmail } from "lib/libs/email/content/respondToRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/respond-to-rai";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <ChipSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        event: "respond-to-rai",
        id: "CO-24-1234",
        authority: "1915(c)",
        actionType: "Amend",
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
