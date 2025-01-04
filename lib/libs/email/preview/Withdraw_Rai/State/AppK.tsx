import { AppKStateEmail } from "../../../content/withdrawRai/emailTemplates/AppKState";
import { emailTemplateValue } from "../../../mock-data/withdraw-rai";
import * as attachments from "../../../mock-data/attachments";

export const relatedEvent = {
  submitterName: "George",
  submitterEmail: "test@email.com",
};

export default () => (
  <AppKStateEmail
    relatedEvent={relatedEvent}
    variables={{
      ...emailTemplateValue,
      origin: "mako",
      event: "respond-to-rai",
      id: "CO-1234.R21.00",
      authority: "1915(c)",
      actionType: "Amend",
      territory: "CO",
      title: "A Perfect Appendix K Amendment Title",
      attachments: {
        cmsForm179: attachments.cmsForm179,
        spaPages: attachments.spaPages,
        other: attachments.other,
      },
    }}
  />
);
