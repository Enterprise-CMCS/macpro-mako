import { CommonEmailVariables, Events } from "shared-types";

import {
  Attachments,
  BasicFooter,
  LoginInstructions,
  PackageDetails,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaDetailsCMSEmail = ({
  variables,
}: {
  variables: Events["NewChipDetailsSubmission"] & CommonEmailVariables;
}) => {
  const previewText = `CHIP Eligibility SPA ${variables.id} Submitted`;
  const heading = "The OneMAC Submission Portal received a CHIP Eligibility State Plan Amendment:";
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
          "CHIP Eligibility SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
