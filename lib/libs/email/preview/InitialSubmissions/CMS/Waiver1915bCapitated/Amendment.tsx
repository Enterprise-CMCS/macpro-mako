import { formatActionType } from "shared-utils";

import { Waiver1915bCMSEmail } from "../../../../content/newSubmission/emailTemplates";
import { emailTemplateValue } from "../../../../mock-data/new-submission";

export default () => {
  return (
    <Waiver1915bCMSEmail
      variables={{
        ...emailTemplateValue,
        waiverNumber: "CO-1234.R21.00",
        attachments: {
          bCapCostSpreadsheets: {
            label: "1915(b) Comprehensive (Capitated) Waiver Cost Effectiveness Spreadsheets",
            files: [
              {
                filename: "capitated-waiver-cost-effectiveness-spreadsheet.pdf",
                title: "test.pdf",
                bucket: "test",
                key: "test",
                uploadDate: Date.now(),
              },
            ],
          },
          bCapWaiverApplication: {
            label: "1915(b) Comprehensive (Capitated) Waiver Application Pre-print",
            files: [
              {
                filename: "capitated-waiver-application.pdf",
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
        event: "capitated-amendment",
        id: "CO-1234.R21.01",
        authority: "1915(b)",
        actionType: formatActionType("Amend"),
      }}
    />
  );
};
