import { MedSpaStateEmail } from "../../../content/new-submission/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

const MedSpaStateEmailPreview = () => {
  return (
    <MedSpaStateEmail
      variables={{
        ...emailTemplateValue,
        event: "new-medicaid-submission",
        id: "CO-22-0123",
        authority: "State Plan",
        actionType: "New",
        territory: "CO",
        title: "Example Medicaid SPA Submission",
        attachments: {
          tribalConsultation: attachments.tribalConsultation,
          other: attachments.other,
          spaPages: attachments.spaPages,
          cmsForm179: attachments.cmsForm179,
          existingStatePlanPages: attachments.existingStatePlanPages,
          publicNotice: attachments.publicNotice,
          sfq: attachments.sfq,
          tribalEngagement: attachments.tribalEngagement,
          coverLetter: attachments.coverLetter,
        },
      }}
    />
  );
};

export default MedSpaStateEmailPreview;
