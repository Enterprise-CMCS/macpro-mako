import { CommonEmailVariables, Events, EmailAddresses } from "shared-types";
import { WithdrawRAI, PackageDetails, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const Waiver1915bCMSEmail = ({
  variables,
  relatedEvent,
}: {
  variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses };
  relatedEvent: Events["RespondToRai"];
}) => {
  const previewText = `Waiver Package ${relatedEvent.id} withdrawn`;
  const heading = `Withdraw Formal RAI Response for Waiver Package ${relatedEvent.id}`;

  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <WithdrawRAI variables={variables} relatedEvent={relatedEvent} />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
    </BaseEmailTemplate>
  );
};
