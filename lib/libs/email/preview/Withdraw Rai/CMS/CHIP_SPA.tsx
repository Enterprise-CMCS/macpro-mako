import { ChipSpaCMSEmail } from "lib/libs/email/content/widthdrawRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/withdraw-rai";
import { relatedEvent } from "./AppK";

export default () => {
  return <ChipSpaCMSEmail relatedEvent={relatedEvent} variables={emailTemplateValue} />;
};
