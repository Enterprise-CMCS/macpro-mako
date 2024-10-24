import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonEmailVariables } from "../../..";
import { RaiResponse } from "shared-types";
import { Html, Container } from "@react-email/components";
import {
  PackageDetails,
  LoginInstructions,
  SpamWarning,
} from "../../email-components";

// 1915b
export const Waiver1915bCMSEmail = (props: {
  variables: RaiResponse & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          The OneMAC Submission Portal received a {variables.authority} Waiver
          RAI Response Submission:
        </h3>
        <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "Waiver Number": variables.id,
            Summary: variables.additionalInformation,
          }}
          attachments={variables.attachments}
        />
        <SpamWarning />
      </Container>
    </Html>
  );
};

const Waiver1915bCMSEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={emailTemplateValue as RaiResponse & CommonEmailVariables}
    />
  );
};

export default Waiver1915bCMSEmailPreview;
