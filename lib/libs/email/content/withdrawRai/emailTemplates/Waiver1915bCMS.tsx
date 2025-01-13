import { WithdrawRAI, PackageDetails, BasicFooter, WithdrawRAIProps } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const Waiver1915bCMSEmail = (props: WithdrawRAIProps) => {
  const { variables, relatedEvent } = { ...props };
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
