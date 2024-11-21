import { AppKCMSEmail } from "lib/libs/email/content/widthdrawRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/withdraw-rai";

export const relatedEvent = {
  submitterName: "George",
  submitterEmail: "test@email.com",
};

export default () => <AppKCMSEmail relatedEvent={relatedEvent} variables={emailTemplateValue} />;
