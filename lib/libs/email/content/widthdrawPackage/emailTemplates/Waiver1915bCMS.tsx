import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { WithdrawPackage } from "shared-types";
import { Html } from "@react-email/components";
import { PackageDetails, SpamWarning } from "../../email-components";

export const Waiver1915bCMSEmail = (props: {
  variables: WithdrawPackage & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a request to withdraw the package
        below. The package will no longer be considered for CMS review:
      </p>
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
    </Html>
  );
};

const Waiver1915bCMSEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={emailTemplateValue as WithdrawPackage & CommonVariables}
    />
  );
};

export default Waiver1915bCMSEmailPreview;
