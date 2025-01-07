import { Waiver1915bCMSEmail } from "../../../content/new-submission/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";
export const WaiverInitialCMSEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={{
        ...emailTemplateValue,
        event: "capitated-initial" as const,
        attachments: {
          bCapWaiverApplication: attachments.bCapWaiverApplication,
          bCapCostSpreadsheets: attachments.bCapCostSpreadsheets,
          tribalConsultation: attachments.tribalConsultation,
          other: attachments.other,
        },
        id: "CO-1234.R21.00",
        authority: "1915(b)",
        actionType: "New",
      }}
    />
  );
};
