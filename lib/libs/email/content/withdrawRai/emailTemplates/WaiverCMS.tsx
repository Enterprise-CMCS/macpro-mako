import { CommonEmailVariables, Events, EmailAddresses } from "shared-types";
import { WithdrawRAI, Attachments, PackageDetails, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverCMSEmail = ({
  variables,
}: {
  variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses };
}) => (
  <BaseEmailTemplate
    previewText={`Waiver Package ${variables.id} withdrawn`}
    heading={`Withdraw Formal RAI Response for Waiver Package ${variables.id}`}
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <WithdrawRAI variables={variables} />
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
