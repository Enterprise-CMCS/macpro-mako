import { CommonEmailVariables, EmailAddresses, Events } from "shared-types";

import { BasicFooter, FollowUpNotice, MailboxNotice, PackageDetails } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverStateEmail = ({
  variables,
}: {
  variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses };
}) => {
  return (
    <BaseEmailTemplate
      previewText={`${variables.authority} ${variables.id} Withdrawn`}
      heading={`The OneMAC Submission Portal received a request to withdraw the Formal RAI Response. You are
        are receiving this email notification as the Formal RAI for ${variables.id} was withdrawn by ${variables.submitterName} ${variables.submitterEmail}.`}
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
      <MailboxNotice type="Waiver" onWaivers={false} />
      <FollowUpNotice includeDidNotExpect={false} />
    </BaseEmailTemplate>
  );
};
