import { emailTemplateValue } from "../data";
import { CommonEmailVariables, Events } from "shared-types";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
  DetailsHeading,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = (props: {
  variables: Events["NewChipSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `CHIP SPA ${variables.id} Submitted`;
  const heading =
    "The OneMAC Submission Portal received a CHIP State Plan Amendment";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<SpamWarning />}
    >
      <DetailsHeading />
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments as any} />
    </BaseEmailTemplate>
  );
};

// To preview with on 'email-dev'
const ChipSpaCMSEmailPreview = () => {
  return (
    <ChipSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        authority: "CHIP SPA",
        event: "new-chip-submission",
        actionType: "Amend",
        origin: "mako",
      }}
    />
  );
};

export default ChipSpaCMSEmailPreview;
