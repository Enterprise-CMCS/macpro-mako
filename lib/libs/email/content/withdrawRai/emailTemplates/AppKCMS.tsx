import { WithdrawRAI, PackageDetails, BasicFooter, Attachments } from "../../email-components";
import { WithdrawRAIProps } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const AppKCMSEmail = ({ variables, relatedEvent }: WithdrawRAIProps) => {
  const previewText = `Withdraw Formal RAI Response for Waiver Package ${relatedEvent.id}`;
  const heading = `Withdraw Formal RAI Response for Waiver Package ${relatedEvent.id}`;

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
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
