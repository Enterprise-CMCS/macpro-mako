import { CommonEmailVariables, Events } from "shared-types";
import { BasicFooter, FollowUpNotice, Divider, PackageDetails } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const MedSpaStateEmail = ({
  variables,
}: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`SPA Package ${variables.id} Withdraw Request`}
    heading="This is confirmation that you have requested to withdraw the package below. The package will no longer be considered for CMS review:"
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <Divider />
    <PackageDetails
      details={{
        "State or territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "Medicaid SPA Package ID": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <FollowUpNotice includeStateLead={false} />
  </BaseEmailTemplate>
);
