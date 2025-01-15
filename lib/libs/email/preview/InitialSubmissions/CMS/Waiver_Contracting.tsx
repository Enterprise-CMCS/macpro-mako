import { Waiver1915bCMSEmail } from "libs/email/content/newSubmission/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/new-submission";

export const Waiver1915bCMSContractingInitialEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={{
        ...emailTemplateValue,
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
        event: "contracting-initial",
        id: "CO-1234.R21.00",
        authority: "1915(b)",
        actionType: "New",
      }}
    />
  );
};

export const Waiver1915bCMSContractingRenewalEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={{
        ...emailTemplateValue,
        event: "contracting-renewal",
        id: "CO-1234.R21.00",
        authority: "1915(b)",
        actionType: "Renewal",
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
          b4IndependentAssessment: {
            label: "1915(b) Comprehensive (Contracting) Independent Assessment",
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
          tribalConsultation: { label: "Tribal Consultation", files: [] },
          other: { label: "Other", files: [] },
        },
      }}
    />
  );
};

export const Waiver1915bCMSContractingAmendmentEmailPreview = () => {
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

export default Waiver1915bCMSContractingInitialEmailPreview;
