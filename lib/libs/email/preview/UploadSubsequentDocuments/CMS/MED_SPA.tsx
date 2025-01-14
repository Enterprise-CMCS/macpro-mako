import { MedSpaCMSEmail } from "libs/email/content/uploadSubsequentDocuments/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/upload-subsequent-documents";
import * as attachments from "libs/email/mock-data/attachments";

const MedicaidSpaCMSEmailPreview = () => {
  return (
    <MedSpaCMSEmail
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

export default MedicaidSpaCMSEmailPreview;
