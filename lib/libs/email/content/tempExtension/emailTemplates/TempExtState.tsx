import { formatNinetyDaysDate } from "shared-utils";
import { CommonEmailVariables, EmailAddresses, Events } from "shared-types";
import { PackageDetails, MailboxNotice, FollowUpNotice, Attachments } from "../../email-components";

import { BaseEmailTemplate } from "../../email-templates";

export const TempExtStateEmail = (props: {
  variables: Events["TempExtension"] & CommonEmailVariables & { emails: EmailAddresses };
}) => {
  const variables = props.variables;
  const previewText = `Temporary Extension ${variables.id} Submitted`;
  const heading =
    "This response confirms you have submitted a Temporary Extension to CMS for review";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<FollowUpNotice />}
    >
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Temporary Extension Request Number": variables.id,
          "Temporary Extension Type": variables.authority,
          "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <MailboxNotice type="Waiver" />
    </BaseEmailTemplate>
  );
};
