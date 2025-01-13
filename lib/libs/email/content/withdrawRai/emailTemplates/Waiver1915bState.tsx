import {
  WithdrawRAI,
  PackageDetails,
  FollowUpNotice,
  MailboxNotice,
  WithdrawRAIProps,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const Waiver1915bStateEmail = (props: WithdrawRAIProps) => {
  const previewText = `Waiver ${props.relatedEvent.id} Withdrawn`;
  const heading = "This response confirms you have withdrawn a Waiver from CMS for review";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={props.variables.applicationEndpointUrl}
      footerContent={<FollowUpNotice />}
    >
      <WithdrawRAI variables={props.variables} relatedEvent={props.relatedEvent} />
      <PackageDetails
        details={{
          "State or Territory": props.variables.territory,
          Name: props.variables.submitterName,
          "Email Address": props.variables.submitterEmail,
          "Waiver Number": props.variables.id,
          Summary: props.variables.additionalInformation,
        }}
      />
      <MailboxNotice type="Waiver" />
    </BaseEmailTemplate>
  );
};
