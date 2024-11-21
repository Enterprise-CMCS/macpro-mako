import { Waiver1915bCMSEmail } from "lib/libs/email/content/widthdrawRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/withdraw-rai";
import { relatedEvent } from "./AppK";

export default () => {
  return <Waiver1915bCMSEmail relatedEvent={relatedEvent} variables={emailTemplateValue} />;
};
