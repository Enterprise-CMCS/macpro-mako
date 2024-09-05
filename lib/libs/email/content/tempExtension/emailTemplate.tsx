import * as React from "react";
import { Html } from "@react-email/components";
import { OneMac } from "shared-types";
import {
  CommonVariables,
  formatAttachments,
  formatNinetyDaysDate,
} from "../..";
import {
  LoginInstructions,
  SpamWarning,
  PackageDetails,
  ContactStateLead,
  MailboxWaiver,
} from "../email-components";

// **** MEDICAID SPA
export const TempExtCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The Submission Portal received a {variables.authority} Waiver Extension
        Submission:
      </p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "Temporary Extension Request Number": variables.id,
          "Temporary Extension Type": variables.authority,
          Summary: variables.additionalInformation,
        }}
      />
      Files: {formatAttachments("html", variables.attachments)}
      <SpamWarning />
    </Html>
  );
};

export const TempExtStateEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        This response confirms you have submitted a {variables.authority} Waiver
        Extension to CMS for review:
      </p>
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
          Summary: variables.additionalInformation,
        }}
      />
      <MailboxWaiver />
      <ContactStateLead />
    </Html>
  );
};

export default TempExtCMSEmail;
