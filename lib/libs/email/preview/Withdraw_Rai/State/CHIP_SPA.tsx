import { ChipSpaStateEmail } from "../../../content/withdrawRai/emailTemplates/ChipSpaState";
import { emailTemplateValue } from "../../../mock-data/withdraw-rai";
import { relatedEvent } from "./AppK";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <ChipSpaStateEmail
      relatedEvent={relatedEvent}
      variables={{
        ...emailTemplateValue,
        origin: "mako",
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
