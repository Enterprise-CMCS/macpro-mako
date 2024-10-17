import * as React from "react";
import { emailTemplateValue } from "../../new-submission/data";
import { OneMac } from "shared-types";
import { CommonVariables, formatNinetyDaysDate } from "../../..";
import { Html, Container } from "@react-email/components";
import {
  PackageDetails,
  MailboxWaiver,
  ContactStateLead,
} from "../../email-components";

export const TempExtStateEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This response confirms you have submitted a {variables.authority}{" "}
          Waiver Extension to CMS for review:
        </h3>
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
        <MailboxWaiver />
        <ContactStateLead />
      </Container>
    </Html>
  );
};

const TempExtCMS = () => {
  return (
    <TempExtStateEmail
      variables={emailTemplateValue as OneMac & CommonVariables}
    />
  );
};

export default TempExtCMS;
