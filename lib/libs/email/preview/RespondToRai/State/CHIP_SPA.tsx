import { add, differenceInDays } from "date-fns";

import { ChipSpaStateEmail } from "../../../content/respondToRai/emailTemplates";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/respond-to-rai";

const pauseDuration = differenceInDays(
  emailTemplateValue.timestamp,
  new Date(emailTemplateValue.raiRequestedDate),
);

const timestamp = add(new Date(emailTemplateValue.submissionDate), {
  days: 90 + pauseDuration,
}).getTime();

export default () => {
  return (
    <ChipSpaStateEmail
      variables={{
        ...emailTemplateValue,
        timestamp,
        event: "respond-to-rai",
        id: "CO-24-1234",
        authority: "1915(c)",
        actionType: "Amend",
        territory: "CO",
        attachments: {
          revisedAmendedStatePlanLanguage: attachments.other,
          officialRAIResponse: attachments.other,
          budgetDocuments: attachments.budgetDocuments,
          publicNotice: attachments.publicNotice,
          tribalConsultation: attachments.tribalConsultation,
          other: attachments.other,
        },
      }}
    />
  );
};
