import * as React from "react";
import { DateTime } from "luxon";
import { emailTemplateValue } from "../data";
import { CommonEmailVariables } from "shared-types";
import { Html, Container } from "@react-email/components";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
} from "../../email-components";

export const Waiver1915bCMSEmail = (props: {
  variables: any & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          The OneMAC Submission Portal received a {variables.authority}{" "}
          {variables.actionType} Submission:
        </h3>
        <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            [`${variables.actionType} Number`]: variables.id,
            "Waiver Authority": variables.authority,
            "Proposed Effective Date": DateTime.fromMillis(
              Number(variables.notificationMetadata?.proposedEffectiveDate),
            ).toFormat("DDDD"),
            Summary: variables.additionalInformation,
          }}
          attachments={variables.attachments}
        />
        <SpamWarning />
      </Container>
    </Html>
  );
};

// To preview with 'email-dev'
const Waiver1915bCMSEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={emailTemplateValue as any & CommonEmailVariables}
    />
  );
};

export default Waiver1915bCMSEmailPreview;
