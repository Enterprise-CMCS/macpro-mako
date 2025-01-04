import { AppKCMSEmail } from "../../../content/withdrawRai/emailTemplates/AppKCMS";
import { emailTemplateValue } from "../../../mock-data/withdraw-rai";
import * as attachments from "../../../mock-data/attachments";

export default () => (
  <AppKCMSEmail
    relatedEvent={{
      submitterName: "George@example.com",
      submitterEmail: "Ringo@example.com",
    }}
    variables={{
      ...emailTemplateValue,
      origin: "mako",
      event: "respond-to-rai",
      id: "CO-1234.R21.00",
      authority: "1915(c)",
      actionType: "Amend",
      territory: "CO",
      title: "A Perfect Appendix K Amendment Title",
      responseDate: 1720000000000,
      timestamp: 1720000000000,
      additionalInformation: "This is a test",
      attachments: {
        cmsForm179: attachments.cmsForm179,
        spaPages: attachments.spaPages,
        other: attachments.other,
      },
    }}
  />
);
