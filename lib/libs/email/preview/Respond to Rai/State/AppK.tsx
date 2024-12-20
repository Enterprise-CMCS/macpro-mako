import { WaiverStateEmail } from "libs/email/content/respondToRai/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/respond-to-rai";
import * as attachments from "../../../mock-data/attachments";

const AppKStateEmailPreview = () => {
  return (
    <WaiverStateEmail
      variables={{
        ...emailTemplateValue,
        event: "respond-to-rai",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        title: "A Perfect Appendix K Amendment Title",
        attachments: {
          raiResponseLetterWaiver: attachments.appk,
          other: attachments.other,
        },
      }}
    />
  );
};

export default AppKStateEmailPreview;
