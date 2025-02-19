import { CommonEmailVariables, Events } from "shared-types";
import { Attachments, PackageDetails, BasicFooter, Divider } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const MedSpaCMSEmail = ({
  variables,
}: {
  variables: Events["WithdrawRai"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Withdraw Formal RAI Response for SPA Package ${variables.id} `}
    heading={`The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are receiving this email notification as the Formal RAI for ${variables.id} was withdrawn by ${variables.submitterName} ${variables.submitterEmail}.`}
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <Divider />
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "SPA Package ID": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <Attachments attachments={variables.attachments} />
  </BaseEmailTemplate>
);
