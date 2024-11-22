import { MedSpaCMSEmail } from "lib/libs/email/content/widthdrawRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/withdraw-rai";
import { relatedEvent } from "./AppK";

export default () => {
  return <MedSpaCMSEmail relatedEvent={relatedEvent} variables={emailTemplateValue} />;
};
