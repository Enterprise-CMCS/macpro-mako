import { ChipSpaStateEmail } from "../../../content/newSubmission/emailTemplates/ChipSpaState";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";
const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        authority: "CHIP SPA",
        event: "new-chip-submission",
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

export default ChipSpaStateEmailPreview;
