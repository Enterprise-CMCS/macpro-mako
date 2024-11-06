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
        event: "respond-to-rai",
        attachments: {
          revisedAmendedStatePlanLanguage: attachments.cmsForm179,
          officialRAIResponse: attachments.spaPages,
          budgetDocuments: attachments.other,
          publicNotice: attachments.other,
          tribalConsultation: attachments.other,
          other: attachments.other,
        },
      }}
    />
  );
};

export default MedSpaStateEmailPreview;
