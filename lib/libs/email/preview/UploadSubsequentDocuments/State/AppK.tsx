import { formatActionType } from "shared-utils";

import { AppKStateEmail } from "../../../content/uploadSubsequentDocuments/emailTemplates/AppKState";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";
const AppKStateEmailPreview = () => {
  return (
    <AppKStateEmail
      variables={{
        ...emailTemplateValue,
        event: "upload-subsequent-documents",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: formatActionType("Amend"),
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
