import { ChipSpaCMSEmail } from "../../../content/withdrawRai/emailTemplates/ChipSpaCMS";
import { emailTemplateValue } from "../../../mock-data/withdraw-rai";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <ChipSpaCMSEmail
      relatedEvent={{
        submitterName: "George@example.com",
        submitterEmail: "Ringo@example.com",
      }}
      variables={{
        ...emailTemplateValue,
        origin: "mako",
        event: "withdraw-rai",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        title: "A Perfect Appendix K Amendment Title",
        responseDate: 1720000000000,
        timestamp: 1720000000000,
        additionalInformation: "This is a test",
        attachments: {
          supportingDocumentation: attachments.spaPages,
        },
      }}
    />
  );
};
