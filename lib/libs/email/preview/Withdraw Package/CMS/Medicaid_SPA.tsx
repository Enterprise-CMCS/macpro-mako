import { ChipSpaCMSEmail } from "lib/libs/email/content/withdrawPackage/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/new-submission";

export default () => {
  return <ChipSpaCMSEmail variables={emailTemplateValue} />;
};
