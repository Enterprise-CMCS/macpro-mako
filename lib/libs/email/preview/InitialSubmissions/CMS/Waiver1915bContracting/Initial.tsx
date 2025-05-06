import { formatActionType } from "shared-utils";

import { Waiver1915bCMSEmail } from "../../../../content/newSubmission/emailTemplates";
import { emailTemplateValue } from "../../../../mock-data/new-submission";

export default () => {
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
        actionType: formatActionType("New"),
      }}
    />
  );
};
