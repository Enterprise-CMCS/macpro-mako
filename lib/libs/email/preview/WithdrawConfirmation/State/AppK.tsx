import { WaiverStateEmail } from "libs/email/content/withdrawConfirmation/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <WaiverStateEmail
      variables={{
        ...emailTemplateValue,
        event: "app-k",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        title: "A Perfect Appendix K Amendment Title",
        attachments: {
          appk: attachments.appk,
          other: attachments.other,
        },
      }}
    />
  );
};
