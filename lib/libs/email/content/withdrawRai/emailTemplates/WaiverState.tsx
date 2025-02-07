import { CommonEmailVariables, Events, EmailAddresses } from "shared-types";
import {
  WithdrawRAI,
  FollowUpNotice,
  BasicFooter,
  PackageDetails,
  MailboxNotice,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverStateEmail = ({
  variables,
}: {
  variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses };
}) => {
  return (
    <BaseEmailTemplate
      previewText={`${variables.authority} ${variables.id} Withdrawn`}
      heading={`This response confirms you have withdrawn a Waiver from CMS for review`}
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
      <MailboxNotice type="Waiver" onWaivers={false} />
      <FollowUpNotice />
    </BaseEmailTemplate>
  );
};
