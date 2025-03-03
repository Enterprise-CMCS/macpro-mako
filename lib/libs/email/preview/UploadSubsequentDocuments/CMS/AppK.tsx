import { AppKCMSEmail } from "../../../content/uploadSubsequentDocuments/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";
import { formatActionType } from "shared-utils";
const AppKCMSEmailPreview = () => {
  return (
    <AppKCMSEmail
      variables={{
        ...emailTemplateValue,
        event: "upload-subsequent-documents",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: formatActionType("Amend", true),
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
