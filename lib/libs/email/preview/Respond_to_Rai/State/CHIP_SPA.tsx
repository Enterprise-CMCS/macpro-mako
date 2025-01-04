import { ChipSpaStateEmail } from "libs/email/content/respondToRai/emailTemplates";
import { emailTemplateValue } from "libs/email/mock-data/respond-to-rai";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        event: "respond-to-rai",
        id: "CO-24-1234",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        attachments: {
          cmsForm179: attachments.cmsForm179,
          spaPages: attachments.spaPages,
          other: attachments.other,
        },
      }}
    />
  );
};
