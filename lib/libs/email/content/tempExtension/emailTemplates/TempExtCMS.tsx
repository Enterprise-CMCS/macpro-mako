import { CommonEmailVariables, Events } from "shared-types";
import {
  PackageDetails,
  LoginInstructions,
  BasicFooter,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { formatNinetyDaysDate } from "shared-utils";

export const TempExtCMSEmail = (props: {
  variables: Events["TempExtension"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Temporary Extension ${variables.id} Submitted`;
  const heading = `The Submission Portal received a ${variables.authority} Temporary Extension Submission:`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
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
    </BaseEmailTemplate>
  );
};
