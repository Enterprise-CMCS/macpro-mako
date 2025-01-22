import { TempExtCMSEmail } from "../../../content/tempExtension/emailTemplates/TempExtCMS";
import { emailTemplateValue } from "../../../mock-data/temp-extension";

const TempExtCMSPreview = () => {
  return (
    <TempExtCMSEmail
      variables={{
        ...emailTemplateValue,
        authority: "1915(b)",
        actionType: "Extend",
      }}
    />
  );
};

export default TempExtCMSPreview;
