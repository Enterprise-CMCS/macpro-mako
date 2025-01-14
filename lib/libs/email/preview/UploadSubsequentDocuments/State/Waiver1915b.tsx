import { WaiversEmailState } from "libs/email/content/uploadSubsequentDocuments/emailTemplates/Waiver1915BState";
import { emailTemplateValue } from "libs/email/mock-data/upload-subsequent-documents";
import * as attachments from "libs/email/mock-data/attachments";

const Waiver1915bStateEmail = () => {
  return (
    <WaiversEmailState
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        event: "upload-subsequent-documents",
        authority: "1915(b)",
        actionType: "Amend",
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

export default Waiver1915bStateEmail;
