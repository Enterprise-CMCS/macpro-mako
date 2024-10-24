import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonEmailVariables } from "../../..";
import { RaiResponse } from "shared-types";
import { Container, Html } from "@react-email/components";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
} from "../../email-components";

export const ChipSpaCMSEmail = (props: {
  variables: RaiResponse & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          The OneMAC Submission Portal received a CHIP SPA RAI Response
          Submission:
        </h3>
        <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "CHIP SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
          attachments={variables.attachments}
        />
        <SpamWarning />
      </Container>
    </Html>
  );
};

const ChipSpaCMSEmailPreview = () => {
  return (
    <ChipSpaCMSEmail
      variables={emailTemplateValue as RaiResponse & CommonEmailVariables}
    />
  );
};

export default ChipSpaCMSEmailPreview;
