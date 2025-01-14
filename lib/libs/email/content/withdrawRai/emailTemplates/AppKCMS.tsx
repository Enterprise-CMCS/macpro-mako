import { CommonEmailVariables, EmailAddresses, Events } from "shared-types";
import { Attachments, PackageDetails, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const AppKCMSEmail = ({
  variables,
  relatedEvent,
}: {
  variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses };
  relatedEvent: Events["RespondToRai"];
}) => {
  const previewText = `Withdraw Formal RAI Response for Waiver Package ${relatedEvent.id}`;
  const heading = `The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are receiving this email notification as the Formal RAI for ${relatedEvent.id} was withdrawn by ${variables.submitterName} ${variables.submitterEmail}.`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
