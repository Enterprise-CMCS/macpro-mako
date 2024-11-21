import { ChipSpaStateEmail } from "lib/libs/email/content/widthdrawPackage/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/new-submission";

export default () => {
  return <ChipSpaStateEmail variables={emailTemplateValue} />;
};
