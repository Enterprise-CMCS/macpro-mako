import { emailTemplateValue } from "../../../mock-data/temp-extension";
import { TempExtStateEmail } from "../../../content/tempExtension/emailTemplates/TempExtState";

const TempExtStatePreview = () => {
  return (
    <TempExtStateEmail
      variables={{
        ...emailTemplateValue,
        authority: "1915(b)",
        actionType: "Extend",
      }}
    />
  );
};

export default TempExtStatePreview;
