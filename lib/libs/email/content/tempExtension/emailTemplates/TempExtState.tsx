import { formatNinetyDaysDate } from "shared-utils";
import { CommonEmailVariables } from "shared-types";
import {
  PackageDetails,
  MailboxNotice,
  ContactStateLead,
  Attachments,
} from "../../email-components";

import { BaseEmailTemplate } from "../../email-templates";
import { emailTemplateValue } from "../data";

export const TempExtStateEmail = (props: { variables: any & CommonEmailVariables }) => {
  const variables = props.variables;
  const previewText = `Temporary Extension ${variables.id} Submitted`;
  const heading =
    "This response confirms you have submitted a Temporary Extension to CMS for review";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<ContactStateLead />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Temporary Extension Request Number": variables.id,
          "Temporary Extension Type": variables.authority,
          "90th Day Deadline": formatNinetyDaysDate(
            Number(variables.notificationMetadata?.submissionDate),
          ),
          summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <MailboxNotice type="Waiver" />
    </BaseEmailTemplate>
  );
};

const TempExtStatePreview = () => {
  return <TempExtStateEmail variables={emailTemplateValue} />;
};

export default TempExtStatePreview;
