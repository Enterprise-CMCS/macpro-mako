import { CommonEmailVariables, Events } from "shared-types";

import { BasicFooter, Divider, FollowUpNotice, PackageDetails } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaStateEmail = ({
  variables,
}: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => {
  const chipPrefix = `CHIP${variables.chipEligibility ? " Eligibility" : ""}`;

  return (
    <BaseEmailTemplate
      previewText={`${chipPrefix} SPA Package ${variables.id} Withdraw Requested`}
      heading="This is confirmation that you have requested to withdraw the package below. The package will no longer be considered for CMS review:"
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
      <FollowUpNotice isChip />
    </BaseEmailTemplate>
  );
};
