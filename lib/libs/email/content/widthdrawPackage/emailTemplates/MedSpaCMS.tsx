import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { WithdrawPackage } from "shared-types";
import { Html, Container } from "@react-email/components";
import { PackageDetails, SpamWarning } from "../../email-components";

export const MedSpaCMSEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          The OneMAC Submission Portal received a request to withdraw the
          package below. The package will no longer be considered for CMS
          review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            Email: variables.submitterEmail,
            "Medicaid SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <SpamWarning />
      </Container>
    </Html>
  );
};

const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaCMSEmail
      variables={emailTemplateValue as WithdrawPackage & CommonVariables}
    />
  );
};

export default MedSpaCMSEmailPreview;
