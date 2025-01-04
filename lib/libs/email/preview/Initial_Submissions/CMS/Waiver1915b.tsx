import { WaiverInitialCMSEmail } from "libs/email/content/new-submission/emailTemplates/Waiver1915bCMS";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";
export const WaiverInitialCapitatedCMSEmailPreview = () => {
  return (
    <WaiverInitialCMSEmail
      variables={{
        ...emailTemplateValue,
        attachments: {
          bCapWaiverApplication: attachments.bCapWaiverApplication,
          bCapCostSpreadsheets: attachments.bCapCostSpreadsheets,
          tribalConsultation: attachments.tribalConsultation,
          other: attachments.other,
        },
        event: "capitated-initial",
        id: "CO-1234.R21.00",
        authority: "1915(b)",
        actionType: "New",
      }}
    />
  );
};
export const WaiverInitialContractingCMSEmailPreview = () => {
  return (
    <WaiverInitialCMSEmail
      variables={{
        ...emailTemplateValue,

        attachments: {
          bCapWaiverApplication: attachments.bCapWaiverApplication,
          bCapCostSpreadsheets: attachments.bCapCostSpreadsheets,
          tribalConsultation: attachments.tribalConsultation,
          other: attachments.other,
        },
        event: "contracting-initial",
        id: "CO-1234.R21.00",
        authority: "1915(b)",
        actionType: "New",
      }}
    />
  );
};

