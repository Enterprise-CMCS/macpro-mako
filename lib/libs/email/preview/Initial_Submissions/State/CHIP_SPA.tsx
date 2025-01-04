import { ChipSpaStateEmail } from "../../../content/new-submission/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        event: "new-chip-submission",
        id: "CO-CHIP-22-0123",
        authority: "CHIP State Plan",
        actionType: "New",
        territory: "CO",
        title: "Example CHIP SPA Submission",
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
