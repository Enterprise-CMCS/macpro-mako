import { AppKStateEmail } from "../../../content/newSubmission/emailTemplates";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";

const AppKCMSEmailPreview = () => {
  return (
    <AppKStateEmail
      variables={{
        ...emailTemplateValue,
        event: "app-k",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        title: "A Perfect Appendix K Amendment Title",
        attachments: {
          appk: attachments.appk,
          other: attachments.other,
        },
      }}
    />
  );
};

export default AppKCMSEmailPreview;
