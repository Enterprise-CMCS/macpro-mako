import { Waiver1915bStateEmail } from "../../../content/new-submission/emailTemplates/Waiver1915bState";
import { emailTemplateValue } from "../../../mock-data/new-submission";

export const Waiver1915bContractingStateInitialEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
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
              {
                filename: "contracting-waiver-application-2.pdf",
                title: "contracting-waiver-supporting-evidence.pdf",
                bucket: "test",
                key: "test2",
                uploadDate: Date.now(),
              },
            ],
          },

          tribalConsultation: { label: "Tribal Consultation", files: [] },
          other: { label: "Other", files: [] },
        },
        event: "contracting-initial",
        id: "CO-9987.R21.00",
        authority: "1915(b)",
        actionType: "New",
      }}
    />
  );
};

export const Waiver1915bContractingStateRenewalEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      variables={{
        ...emailTemplateValue,
        waiverNumber: "CO-1234.R21.00",
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
        actionType: "Renewal",
      }}
    />
  );
};

export const Waiver1915bContractingStateAmendmentEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      variables={{
        ...emailTemplateValue,
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
          tribalConsultation: { label: "Tribal Consultation", files: [] },
          other: { label: "Other", files: [] },
        },
        event: "contracting-amendment",
        id: "CO-1234.R21.01",
        authority: "1915(b)",
        actionType: "Amendment",
      }}
    />
  );
};
