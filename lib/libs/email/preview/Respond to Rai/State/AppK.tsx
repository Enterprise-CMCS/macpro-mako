import { WaiverStateEmail } from "lib/libs/email/content/respondToRai/emailTemplates";
import { emailTemplateValue } from "lib/libs/email/mock-data/respond-to-rai";

const AppKStateEmailPreview = () => {
  return (
    <WaiverStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        title: "A Perfect Appendix K Amendment Title",
      }}
    />
  );
};

export default AppKStateEmailPreview;
