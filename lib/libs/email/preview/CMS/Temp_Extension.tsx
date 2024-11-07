import { TempExtCMSEmail } from "../../content/tempExtension/emailTemplates/TempExtCMS";
import { emailTemplateValue } from "../../mock-data/temp-extension";

const TempExtCMSPreview = () => {
  return (
    <TempExtCMSEmail
      variables={{
        ...emailTemplateValue,
      }}
    />
  );
};

export default TempExtCMSPreview;
