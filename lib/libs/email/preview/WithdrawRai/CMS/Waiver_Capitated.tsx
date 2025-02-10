import { WaiverCMSEmail } from "libs/email/content/withdrawRai/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <WaiverCMSEmail
      variables={{
        ...emailTemplateValue,
        authority: "1915(b)",
        event: "withdraw-rai",
        id: "CO-1234.R21.00",
        actionType: "",
        attachments: {
          supportingDocumentation: attachments.supportingDocumentation,
        },
      }}
    />
  );
};
