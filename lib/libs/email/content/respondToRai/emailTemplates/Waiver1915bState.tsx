import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables, formatNinetyDaysDate } from "../../..";
import { RaiResponse } from "shared-types";
import { Html, Container } from "@react-email/components";
import {
  PackageDetails,
  MailboxWaiver,
  ContactStateLead,
} from "../../email-components";

export const Waiver1915bStateEmail = (props: {
  variables: RaiResponse & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          This response confirms the submission of your {variables.authority}{" "}
          Waiver RAI Response to CMS for review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "Initial Waiver Number": variables.id,
            "Waiver Authority": variables.authority,
            "90th Day Deadline": formatNinetyDaysDate(variables.responseDate),
            Summary: variables.additionalInformation,
          }}
        />
        <p>
          This response confirms the receipt of your Waiver request or your
          response to a Waiver Request for Additional Information (RAI). You can
          expect a formal response to your submittal to be issued within 90
          days, before {formatNinetyDaysDate(variables.responseDate)}.
        </p>
        <MailboxWaiver />
        <ContactStateLead />
      </Container>
    </Html>
  );
};

const Waiver1915bStateEmailPreview = () => {
  return (
    <Waiver1915bStateEmail
      variables={emailTemplateValue as RaiResponse & CommonVariables}
    />
  );
};

export default Waiver1915bStateEmailPreview;
