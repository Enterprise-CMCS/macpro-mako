import { ChipSpaCMSEmail } from "../../../content/respondToRai/emailTemplates/ChipSpaCMS";
import { emailTemplateValue } from "../../../mock-data/respond-to-rai";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <ChipSpaCMSEmail
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
