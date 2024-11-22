import { AppKCMSEmail } from "../../../content/new-submission/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/new-submission";
import * as attachments from "../../../mock-data/attachments";
const AppKCMSEmailPreview = () => {
  return (
    <AppKCMSEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        waiverIds: ["CO-1234.R21.01", "CO-12345.R03.09", "CO-4567.R15.42"],
        actionType: "Amend",
        seaActionType: "amend",
        state: "CO",
        title: "A Perfect Appendix K Amendment Title",
        attachments: {
          appk: attachments.appk,
          other: attachments.other,
        },
      }}
    />
  );
};

export default AppKCMSEmailPreview;
