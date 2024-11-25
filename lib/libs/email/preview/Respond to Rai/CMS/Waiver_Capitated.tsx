import { WaiverCMSEmail } from "lib/libs/email/content/widthdrawRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/respond-to-rai";

export default () => {
  return <WaiverCMSEmail variables={emailTemplateValue} />;
};
