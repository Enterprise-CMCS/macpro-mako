import {
  WaiverInitialStateEmail,
} from "../../../content/new-submission/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

export const WaiverInitialStateEmailPreview = () => {
  return (
    <WaiverInitialStateEmail
      variables={{
        ...emailTemplateValue,
        event: "capitated-initial" as const,
        id: "CO-12345.R00.00",
        authority: "1915(b)",
        actionType: "New",
        territory: "CO",
        title: "Example 1915(b) Waiver Submission",
        attachments: {
          bCapWaiverApplication: attachments.bCapWaiverApplication,
          bCapCostSpreadsheets: attachments.bCapCostSpreadsheets,
          tribalConsultation: attachments.tribalConsultation,
          other: attachments.other,
        },
      }}
    />
  );
};