import { ChipSpaDetailsCMSEmail } from "../../../content/newSubmission/emailTemplates/ChipSpaDetailsCMS";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";
const ChipSpaDetailsCMSEmailPreview = () => {
  return (
    <ChipSpaDetailsCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        authority: "CHIP SPA",
        event: "new-chip-details-submission",
        chipSubmissionType: ["MAGI Eligibility and Methods"],
        actionType: "Amend",
        attachments: {
          chipEligibility: attachments.chipEligibility,
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

export default ChipSpaDetailsCMSEmailPreview;
