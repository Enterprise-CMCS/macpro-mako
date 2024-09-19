import * as React from "react";
import { emailTemplateValue } from "../../new-submission/data";
import { OneMac } from "shared-types";
import { CommonVariables } from "../../..";
import { Html, Container } from "@react-email/components";
import {
  PackageDetails,
  LoginInstructions,
  SpamWarning,
} from "../../email-components";

export const TempExtCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          The Submission Portal received a {variables.authority} Waiver
          Extension Submission:
        </h3>
        <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            Email: variables.submitterEmail,
            "Temporary Extension Request Number": variables.id,
            "Temporary Extension Type": variables.authority,
            summary: variables.additionalInformation,
          }}
          attachments={variables.attachments}
        />
        <SpamWarning />
      </Container>
    </Html>
  );
};

const TempExtCMSPreview = () => {
  return (
    <TempExtCMSEmail
      variables={emailTemplateValue as OneMac & CommonVariables}
    />
  );
};

export default TempExtCMSPreview;
