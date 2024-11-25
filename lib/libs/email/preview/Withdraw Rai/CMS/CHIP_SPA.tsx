import { ChipSpaCMSEmail } from "lib/libs/email/content/upload-subsequent-documents/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/upload-subsequent-documents";
import { relatedEvent } from "./AppK";

export default () => {
  return <ChipSpaCMSEmail relatedEvent={relatedEvent} variables={emailTemplateValue} />;
};
