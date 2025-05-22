import { ChipSpaCMSEmail } from "../../../content/respondToRai/emailTemplates";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/respond-to-rai";

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
