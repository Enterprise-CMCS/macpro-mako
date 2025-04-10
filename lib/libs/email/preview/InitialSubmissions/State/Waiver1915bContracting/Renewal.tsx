import { Waiver1915bStateEmail } from "libs/email/content/newSubmission/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/new-submission";
import { formatActionType } from "shared-utils";

export default () => {
  return (
    <Waiver1915bStateEmail
      variables={{
        ...emailTemplateValue,
        waiverNumber: "CO-1234.R21.00",
        additionalInformation: "Testing with an emoji 😄",
        attachments: {
          b4IndependentAssessment: {
            label: "1915(b) Comprehensive (Contracting) Waiver Independent Assessment",
            files: [
              {
                filename: "contracting-waiver-independent-assessment.pdf",
                title: "test.pdf",
                bucket: "test",
                key: "test",
                uploadDate: Date.now(),
              },
            ],
          },
          b4WaiverApplication: {
            label: "1915(b) Comprehensive (Contracting) Waiver Application Pre-print",
            files: [
              {
                filename: "contracting-waiver-application.pdf",
                title: "test.pdf",
                bucket: "test",
                key: "test",
                uploadDate: Date.now(),
              },
            ],
          },

          tribalConsultation: { label: "Tribal Consultation", files: [] },
          other: { label: "Other", files: [] },
        },
        event: "contracting-renewal",
        id: "CO-9987.R21.00",
        authority: "1915(b)",
        actionType: formatActionType("Renew"),
      }}
    />
  );
};
