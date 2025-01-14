import { TempExtCMSEmail } from "../../../content/tempExtension/emailTemplates";
import { emailTemplateValue } from "../../../mock-data/temp-extension";

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
