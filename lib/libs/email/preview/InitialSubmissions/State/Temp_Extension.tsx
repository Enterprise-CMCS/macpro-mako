import { emailTemplateValue } from "../../../mock-data/temp-extension";

import { TempExtStateEmail } from "../../../content/tempExtension/emailTemplates/TempExtState";
import { Events } from "lib/packages/shared-types";
import { CommonEmailVariables } from "lib/packages/shared-types";

const TempExtStatePreview = () => {
  return (
    <TempExtStateEmail
      variables={{
        ...emailTemplateValue,
        authority: "1915(b)",
        actionType: "Extend",
        } as Events["TemporaryExtension"] & CommonEmailVariables
      }
    />
  );
};

export default TempExtStatePreview;
