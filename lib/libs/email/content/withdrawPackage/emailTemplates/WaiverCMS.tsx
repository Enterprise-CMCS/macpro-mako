import { CommonEmailVariables, Events } from "shared-types";
import { SpamWarning, PackageDetails, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverCMSEmail = ({
  variables,
}: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Waiver Package ${variables.id} Withdraw Request`}
    heading="The OneMAC Submission Portal received a request to withdraw the package below. The package will no longer be considered for CMS review:"
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "Waiver Number": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <SpamWarning />
  </BaseEmailTemplate>
);
