import { CommonEmailVariables, Events } from "shared-types";
import {
  PackageDetails,
  LoginInstructions,
  BasicFooter,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const MedSpaCMSEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Medicaid SPA ${variables.id} RAI Response Submitted`;
  const heading = "The OneMAC Submission Portal received a Medicaid SPA RAI Response Submission:";

  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "Medicaid SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
