import { CommonEmailVariables, Events } from "shared-types";

import {
  Attachments,
  BasicFooter,
  LoginInstructions,
  PackageDetails,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = ({
  variables,
}: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const chipPrefix = `CHIP${variables.isChipEligibility ? " Eligibility" : ""}`;

  return (
    <BaseEmailTemplate
      previewText={`RAI Response for ${variables.id} Submitted`}
      heading={`The OneMAC Submission Portal received a ${chipPrefix} SPA RAI Response Submission:`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${chipPrefix} SPA Package ID`]: variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
