import { TempExtStateEmail } from "../../../content/tempExtension/emailTemplates/TempExtState";
import { emailTemplateValue } from "../../../mock-data/temp-extension";

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
