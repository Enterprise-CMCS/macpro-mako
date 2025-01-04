import { MedSpaCMSEmail } from "../../../content/withdrawRai/emailTemplates/MedSpaCMS";
import { emailTemplateValue } from "../../../mock-data/withdraw-rai";
import * as attachments from "../../../mock-data/attachments";
import { relatedEvent } from "../State/AppK";

export default () => {
  return (
    <MedSpaCMSEmail
      relatedEvent={relatedEvent}
      variables={{
        ...emailTemplateValue,
        origin: "mako",
        event: "withdraw-rai",
        id: "CO-24-1234",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        attachments: {
          supportingDocumentation: attachments.supportingDocumentation,
        },
      }}
    />
  );
};
