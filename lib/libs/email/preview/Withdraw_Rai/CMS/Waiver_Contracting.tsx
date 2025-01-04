import { Waiver1915bCMSEmail } from "../../../content/withdrawRai/emailTemplates/Waiver1915bCMS";
import { emailTemplateValue } from "../../../mock-data/withdraw-rai";
import * as attachments from "../../../mock-data/attachments";
import { relatedEvent } from "../State/AppK";
export default () => {
  return (
    <Waiver1915bCMSEmail
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
