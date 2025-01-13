import {
  PackageDetails,
  BasicFooter,
  MailboxNotice,
  FollowUpNotice,
  WithdrawRAI,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { WithdrawRAIProps } from "../../email-components";

export const AppKStateEmail = (props: WithdrawRAIProps) => {
  const { variables, relatedEvent } = { ...props };
  const previewText = `Withdraw Formal RAI Response for Waiver Package ${relatedEvent.id}`;
  const heading = `The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are receiving this email notification as the Formal RAI for ${relatedEvent.id} was withdrawn by ${variables.submitterName} ${variables.submitterEmail}.`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <WithdrawRAI relatedEvent={relatedEvent} variables={variables} />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <MailboxNotice type="Waiver" />
      <FollowUpNotice />
    </BaseEmailTemplate>
  );
};
