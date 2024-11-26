import { WaiverStateEmail } from "lib/libs/email/content/withdrawConfirmation/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/new-submission";

export default () => {
  return <WaiverStateEmail variables={{ ...emailTemplateValue, id: "MD-6543.R67.32" }} />;
};
