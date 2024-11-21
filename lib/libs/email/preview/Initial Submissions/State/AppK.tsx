import { AppKStateEmail } from "../../../content/new-submission/emailTemplates";
import * as attachments from "../../../mock-data/attachments";
import { emailTemplateValue } from "../../../mock-data/new-submission";

const AppKStateEmailPreview = () => {
  return (
    <AppKStateEmail
      variables={{
        ...emailTemplateValue,
        id: "CO-1234.R21.00",
        state: "CO",
        waiverIds: ["1234-56768", "1234-56769"],
        actionType: "Amend",
        seaActionType: "amend",
        title: "App K For The State - 2024",
        attachments: {
          appk: attachments.appk,
          other: attachments.other,
        },
      }}
    />
  );
};

export default AppKStateEmailPreview;
