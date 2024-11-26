import { WaiverCMSEmail } from "lib/libs/email/content/withdrawPackage/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/new-submission";

export default () => {
  return <WaiverCMSEmail variables={{ ...emailTemplateValue, id: "MD-5739.R00.00" }} />;
};
