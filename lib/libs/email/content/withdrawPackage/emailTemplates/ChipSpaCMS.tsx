import { CommonEmailVariables, Events } from "shared-types";

import { BasicFooter, Divider, PackageDetails } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = ({
  variables,
}: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => {
  const chipPrefix = `CHIP${variables.isChipEligibility ? " Eligibility" : ""}`;

  return (
    <BaseEmailTemplate
      previewText={`${chipPrefix} SPA Package ${variables.id} Withdraw Requested`}
      heading="The OneMAC Submission Portal received a request to withdraw the package below. The package will no longer be considered for CMS review:"
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <Divider />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${chipPrefix} SPA Package ID`]: variables.id,
          Summary: variables.additionalInformation,
        }}
      />
    </BaseEmailTemplate>
  );
};
