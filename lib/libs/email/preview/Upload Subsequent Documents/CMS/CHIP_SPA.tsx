import { ChipSpaCMSEmail } from "lib/libs/email/content/upload-subsequent-documents/emailTemplates/ChipSpaCMS";
import { emailTemplateValue } from "lib/libs/email/mock-data/upload-subsequent-documents";
import * as attachments from "lib/libs/email/mock-data/attachments";

const ChipSpaCMSEmailPreview = () => {
  return (
    <ChipSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        event: "upload-subsequent-documents",
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

export default ChipSpaCMSEmailPreview;
