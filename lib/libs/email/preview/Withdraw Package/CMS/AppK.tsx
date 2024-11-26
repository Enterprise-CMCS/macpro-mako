import { WaiverCMSEmail } from "lib/libs/email/content/widthdrawPackage/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/new-submission";

export default () => {
  return <WaiverCMSEmail variables={{ ...emailTemplateValue, id: "MD-6543.R67.32" }} />;
};
