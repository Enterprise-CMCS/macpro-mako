import { CommonEmailVariables, Events } from "shared-types";
import { SpamWarning, PackageDetails, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverCMSEmail = (props: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Withdrawal of ${variables.authority} ${variables.id}`;
  const heading =
    "The OneMAC Submission Portal received a request to withdraw the package below. The package will no longer be considered for CMS review:";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <SpamWarning />
    </BaseEmailTemplate>
  );
};
