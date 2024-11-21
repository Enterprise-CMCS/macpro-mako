import { emailTemplateValue } from "../../../mock-data/temp-extension";

import { TempExtStateEmail } from "../../../content/tempExtension/emailTemplates/TempExtState";

const TempExtStatePreview = () => {
  return (
    <TempExtStateEmail
      variables={{
        ...emailTemplateValue,
      }}
    />
  );
};

export default TempExtStatePreview;
