import { ChipSpaStateEmail } from "lib/libs/email/content/upload-subsequent-documents/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/upload-subsequent-documents";
import { relatedEvent } from "../CMS/AppK";

export default () => {
  return <ChipSpaStateEmail relatedEvent={relatedEvent} variables={emailTemplateValue} />;
};
