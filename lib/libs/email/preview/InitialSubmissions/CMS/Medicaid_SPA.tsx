import { MedSpaCMSEmail } from "../../../content/newSubmission/emailTemplates/MedSpaCMS";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";

export default () => {
  return (
    <MedSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-24-2200",
        territory: "CO",
        authority: "Medicaid SPA",
        event: "new-medicaid-submission",
        actionType: "Initial",
        attachments: {
          tribalConsultation: attachments.tribalConsultation,
          cmsForm179: attachments.cmsForm179,
          sfq: attachments.sfq,
          spaPages: attachments.spaPages,
          coverLetter: attachments.coverLetter,
          tribalEngagement: attachments.tribalEngagement,
          existingStatePlanPages: attachments.existingStatePlanPages,
          publicNotice: attachments.publicNotice,
          other: attachments.other,
        },
      }}
    />
  );
};
