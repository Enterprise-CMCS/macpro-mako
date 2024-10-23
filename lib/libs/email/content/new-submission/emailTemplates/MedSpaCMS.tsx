import * as React from "react";
import { emailTemplateValue } from "../data";
import { OneMac } from "shared-types";
import { CommonVariables, formatDate } from "../../..";
import { Html, Container } from "@react-email/components";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
} from "../../email-components";

export const MedSpaCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          The OneMAC Submission Portal received a Medicaid SPA Submission:
        </h3>
        <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            Email: variables.submitterEmail,
            "Medicaid SPA ID": variables.id,
            "Proposed Effective Date": formatDate(
              variables.notificationMetadata?.proposedEffectiveDate,
            ),
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
const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaCMSEmail
      variables={emailTemplateValue as OneMac & CommonVariables}
    />
  );
};

export default MedSpaCMSEmailPreview;
