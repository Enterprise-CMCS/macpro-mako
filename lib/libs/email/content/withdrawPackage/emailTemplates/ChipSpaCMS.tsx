import { CommonEmailVariables, Events } from "lib/packages/shared-types";
import { BasicFooter, PackageDetails, SpamNotice } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = ({
  variables,
}: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`CHIP SPA Package ${variables.id} Withdraw Request`}
    heading="The OneMAC Submission Portal received a request to withdraw the package below. The package will no longer be considered for CMS review:"
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <PackageDetails
      details={{
        "State or territory": variables.territory,
        Name: variables.submitterName,
        Email: variables.submitterEmail,
        "CHIP SPA Package ID": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <SpamNotice />
  </BaseEmailTemplate>
);