import { CommonEmailVariables, Events, RelatedEventType } from "shared-types";
import { Attachments, PackageDetails, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const AppKCMSEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
  relatedEvent: RelatedEventType;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <BaseEmailTemplate
      previewText="Withdraw Formal RAI Response for Waiver Package"
      heading={`The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are receiving this email notification as the Formal RAI for ${variables.id} was withdrawn by ${variables.submitterName} ${variables.submitterEmail}.`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
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
