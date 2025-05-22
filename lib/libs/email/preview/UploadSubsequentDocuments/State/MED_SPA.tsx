import { MedSpaStateEmail } from "../../../content/uploadSubsequentDocuments/emailTemplates/MedSpaState";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/upload-subsequent-documents";
const MedicaidSpaStateEmailPreview = () => {
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

export default MedicaidSpaStateEmailPreview;
