import { CommonEmailVariables, Events } from "shared-types";
import {
  FollowUpNotice,
  BasicFooter,
  PackageDetails,
  MailboxNotice,
  Divider,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverStateEmail = ({
  variables,
}: {
  variables: Events["WithdrawRai"] & CommonEmailVariables;
}) => {
  return (
    <BaseEmailTemplate
      previewText={`Withdraw Formal RAI Response for Waiver Package ${variables.id}`}
      heading={`The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are receiving this email notification as the Formal RAI for ${variables.id} was withdrawn by ${variables.submitterName} ${variables.submitterEmail}.`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Divider />
      <MailboxNotice type="Waiver" onWaivers={false} />
      <FollowUpNotice />
    </BaseEmailTemplate>
  );
};
