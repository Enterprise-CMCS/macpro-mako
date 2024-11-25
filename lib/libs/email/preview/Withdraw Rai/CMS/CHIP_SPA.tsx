import { ChipSpaCMSEmail } from "lib/libs/email/content/upload-subsequent-documents/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/upload-subsequent-documents";

export default () => {
  return <ChipSpaCMSEmail variables={emailTemplateValue} />;
};
