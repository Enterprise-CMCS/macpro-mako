import { emailTemplateValue } from "libs/email/mock-data/new-submission";
import { ChipSpaStateEmail } from "libs/email/content/new-submission/emailTemplates";
import * as attachments from "libs/email/mock-data/attachments";
const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-CHIP-22-0123",
        authority: "CHIP State Plan",
        actionType: "New",
        territory: "CO",
        title: "Example CHIP SPA Submission",
        event: "new-chip-submission",
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
