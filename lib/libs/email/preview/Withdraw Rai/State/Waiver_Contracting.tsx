import { Waiver1915bStateEmail } from "lib/libs/email/content/widthdrawPackage/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/withdraw-rai";
import { relatedEvent } from "../CMS/AppK";

export default () => {
  return <Waiver1915bStateEmail relatedEvent={relatedEvent} variables={emailTemplateValue} />;
};
