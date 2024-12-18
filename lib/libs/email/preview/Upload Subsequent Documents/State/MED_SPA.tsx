import { emailTemplateValue } from "libs/email/mock-data/upload-subsequent-documents";
import { MedSpaStateEmail } from "libs/email/content/upload-subsequent-documents/emailTemplates";
import * as attachments from "libs/email/mock-data/attachments";
const MedSpaStateEmailPreview = () => {
  return (
    <MedSpaStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        event: "upload-subsequent-documents",
        actionType: "Amend",
        authority: "Medicaid SPA",
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

export default MedSpaStateEmailPreview;
