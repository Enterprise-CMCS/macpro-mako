import { Waiver1915bStateEmail } from "../../content/respondToRai/emailTemplates/Waiver1915bState";
import * as attachments from "../../mock-data/attachments";
import { emailTemplateValue } from "../../mock-data/respond-to-rai";

const Waiver1915bStateEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        territory: "CO",
        authority: "Waiver 1915b",
        attachments: {
          cmsForm179: attachments.cmsForm179,
          spaPages: attachments.spaPages,
          other: attachments.other,
        },
      }}
    />
  );
};

export default Waiver1915bStateEmailPreview;
