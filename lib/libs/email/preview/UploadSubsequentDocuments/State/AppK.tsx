import { AppKStateEmail } from "libs/email/content/uploadSubsequentDocuments/emailTemplates/AppKState";
import { emailTemplateValue } from "libs/email/mock-data/new-submission";
import * as attachments from "libs/email/mock-data/attachments";
const AppKStateEmailPreview = () => {
  return (
    <AppKStateEmail
      variables={{
        ...emailTemplateValue,
        event: "upload-subsequent-documents",
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

export default AppKStateEmailPreview;
