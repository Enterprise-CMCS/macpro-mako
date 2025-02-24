import { Waiver1915bCMSEmail } from "libs/email/content/newSubmission/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/new-submission";

export default () => {
  return (
    <Waiver1915bCMSEmail
      variables={{
        ...emailTemplateValue,
        event: "contracting-amendment",
        id: "CO-1234.R21.01",
        authority: "1915(b)",
        actionType: "Amendment",
        waiverNumber: "CO-1234.R21.00",
        attachments: {
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
          tribalConsultation: {
            label: "Tribal Consultation",
            files: [
              {
                filename: "contracting-waiver-tribal-consultation.pdf",
                title: "test.pdf",
                bucket: "test",
                key: "test",
                uploadDate: Date.now(),
              },
            ],
          },
          other: { label: "Other", files: [] },
        },
      }}
    />
  );
};
