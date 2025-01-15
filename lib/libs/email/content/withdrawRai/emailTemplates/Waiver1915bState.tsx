import { CommonEmailVariables, EmailAddresses, Events } from "shared-types";
import { WithdrawRAI, PackageDetails, FollowUpNotice, MailboxNotice } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const Waiver1915bStateEmail = ({
  variables,
  relatedEvent,
}: {
  variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses };
  relatedEvent: Events["RespondToRai"];
}) => {
  const previewText = `Waiver ${relatedEvent.id} Withdrawn`;
  const heading = "This response confirms you have withdrawn a Waiver from CMS for review";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<FollowUpNotice />}
    >
      <WithdrawRAI variables={variables} relatedEvent={relatedEvent} />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "Waiver Number": variables.id,
          Summary: relatedEvent.additionalInformation,
        }}
      />
      <MailboxNotice type="Waiver" />
    </BaseEmailTemplate>
  );
};
