import { Waiver1915bStateEmail } from "../../../content/withdrawRai/emailTemplates/Waiver1915bState";
import { emailTemplateValue } from "../../../mock-data/withdraw-rai";
import { relatedEvent } from "./AppK";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <Waiver1915bStateEmail
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
