import { MedSpaCMSEmail } from "../../../content/respondToRai/emailTemplates/MedSpaCMS";
import { emailTemplateValue } from "../../../mock-data/respond-to-rai";
import * as attachments from "../../../mock-data/attachments";

export default () => {
  return (
    <MedSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        event: "respond-to-rai",
        id: "CO-1234.R21.00",
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
