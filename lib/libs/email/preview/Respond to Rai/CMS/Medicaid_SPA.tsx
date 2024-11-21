import { MedSpaCMSEmail } from "../../../content/respondToRai/emailTemplates/MedSpaCMS";
import { emailTemplateValue } from "../../../mock-data/respond-to-rai";

export default () => {
  return <MedSpaCMSEmail variables={emailTemplateValue} />;
};
