import { MedSpaStateEmail } from "../../content/new-submission/emailTemplates";
import { emailTemplateValue } from "../../mock-data/new-submission";
import * as attachments from "../../mock-data/attachments";

const MedSpaStateEmailPreview = () => {
  return (
    <MedSpaStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-1234",
        event: "new-medicaid-submission",
        authority: "Medicaid SPA",
        actionType: "Amend",
        attachments: {
          cmsForm179: attachments.cmsForm179,
          spaPages: attachments.spaPages,
          tribalEngagement: attachments.tribalEngagement,
          existingStatePlanPages: attachments.existingStatePlanPages,
          publicNotice: attachments.publicNotice,
          other: attachments.other,
          sfq: attachments.sfq,
          tribalConsultation: attachments.tribalConsultation,
          coverLetter: attachments.coverLetter,
        },
      }}
    />
  );
};

export default MedSpaStateEmailPreview;
