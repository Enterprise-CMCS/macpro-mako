import { Waiver1915bCMSEmail } from "lib/libs/email/content/widthdrawPackage/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/respond-to-rai";

export default () => {
  return <Waiver1915bCMSEmail variables={emailTemplateValue} />;
};
