import * as RAIResponse from "../../mock-data/respond-to-rai";
import { MedSpaStateEmail } from "../../content/respondToRai/emailTemplates/MedSpaState";
import * as attachments from "../../mock-data/attachments";

export const MedSpaStateEmailPreview = () => {
  return (
    <MedSpaStateEmail
      variables={{
        ...RAIResponse.emailTemplateValue,
        id: "CO-1234.R21.00",
        territory: "CO",
        authority: "Medicaid SPA",
        attachments: {
          cmsForm179: attachments.cmsForm179,
          spaPages: attachments.spaPages,
          other: attachments.other,
        },
      }}
    />
  );
};

export default MedSpaStateEmailPreview;
