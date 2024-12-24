import { Waiver1915bStateEmail } from "../../../content/withdrawRai/emailTemplates/Waiver1915bState";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  const relatedEvent = {
    submitterName: "Test User",
    submitterEmail: "test@example.com",
  };

  return (
    <Waiver1915bStateEmail
      relatedEvent={relatedEvent}
      variables={{
        ...emailTemplateValue,
        event: "respond-to-rai",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        title: "A Perfect Appendix K Amendment Title",
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
