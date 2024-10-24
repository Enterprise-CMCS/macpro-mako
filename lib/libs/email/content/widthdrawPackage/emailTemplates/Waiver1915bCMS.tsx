import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonEmailVariables } from "../../..";
import { WithdrawPackage } from "shared-types";
import { Html, Container } from "@react-email/components";
import { PackageDetails, SpamWarning } from "../../email-components";

export const Waiver1915bCMSEmail = (props: {
  variables: WithdrawPackage & CommonEmailVariables;
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
            [`${variables.authority} Package ID`]: variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <SpamWarning />
      </Container>
    </Html>
  );
};

const Waiver1915bCMSEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={emailTemplateValue as WithdrawPackage & CommonEmailVariables}
    />
  );
};

export default Waiver1915bCMSEmailPreview;
