import { TempExtStateEmail } from "../../../content/tempExtension/emailTemplates/TempExtState";
import { Events, CommonEmailVariables } from "node_modules/shared-types";

type TempExtStateEmailProps = Events["TemporaryExtension"] & CommonEmailVariables;

const TempExtStatePreview = (variables: TempExtStateEmailProps) => {
  return (
    <TempExtStateEmail
      variables={{
        ...variables,
        actionType: "Extend",
        authority: "1915(c)",
        attachments: {
          waiverExtensionRequest: {
            label: "Waiver Extension Request",
            files: [],
          },
          other: {
            label: "Other",
            files: [],
          },
        },
      }}
    />
  );
};

export default TempExtStatePreview;
