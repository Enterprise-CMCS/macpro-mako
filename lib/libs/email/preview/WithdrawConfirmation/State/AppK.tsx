import { formatActionType } from "shared-utils";

import { WaiverStateEmail } from "../../../content/withdrawConfirmation/emailTemplates";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";

export default () => {
  return (
    <WaiverStateEmail
      variables={{
        ...emailTemplateValue,
        event: "app-k",
        id: "CO-1234.R21.00",
        authority: "1915(c)",
        actionType: formatActionType("Amend"),
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
