import { formatActionType } from "shared-utils";

import { WaiversEmailCMS } from "../../../content/uploadSubsequentDocuments/emailTemplates/Waiver1915BCMS";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/upload-subsequent-documents";

const Waiver1915bCMSEmail = () => {
  return (
    <WaiversEmailCMS
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        event: "upload-subsequent-documents",
        authority: "1915(b)",
        actionType: formatActionType("Amend"),
        attachments: {
          currentStatePlan: attachments.currentStatePlan,
          amendedLanguage: attachments.amendedLanguage,
          coverLetter: attachments.coverLetter,
          budgetDocuments: attachments.budgetDocuments,
          publicNotice: attachments.publicNotice,
          tribalConsultation: attachments.tribalConsultation,
          other: attachments.other,
        },
      }}
    />
  );
};

export default Waiver1915bCMSEmail;
