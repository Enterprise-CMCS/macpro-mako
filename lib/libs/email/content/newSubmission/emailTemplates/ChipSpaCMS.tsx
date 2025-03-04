import { CommonEmailVariables, Events } from "shared-types";
import {
  LoginInstructions,
  PackageDetails,
  BasicFooter,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = ({
  variables,
}: {
  variables: Events["NewChipSubmission"] & CommonEmailVariables;
}) => {
  const previewText = `CHIP SPA ${variables.id} Submitted`;
  const heading = "The OneMAC Submission Portal received a CHIP State Plan Amendment:";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} useThisLink />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
