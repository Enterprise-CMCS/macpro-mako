import { AppKStateEmail } from "lib/libs/email/content/withdrawRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/withdraw-rai";

export const relatedEvent = {
  submitterName: "George",
  submitterEmail: "test@email.com",
};

export default () => <AppKStateEmail relatedEvent={relatedEvent} variables={emailTemplateValue} />;
