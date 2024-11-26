import { ChipSpaCMSEmail } from "lib/libs/email/content/respondToRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/respond-to-rai";

export default () => {
  return <ChipSpaCMSEmail variables={emailTemplateValue} />;
};