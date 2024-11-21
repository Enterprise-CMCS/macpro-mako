import { ChipSpaStateEmail } from "lib/libs/email/content/widthdrawRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/withdraw-rai";
import { relatedEvent } from "../CMS/AppK";

export default () => {
  return <ChipSpaStateEmail relatedEvent={relatedEvent} variables={emailTemplateValue} />;
};
