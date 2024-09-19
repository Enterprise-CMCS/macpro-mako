import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { RaiResponse } from "shared-types";
import { Html } from "@react-email/components";
import {
  PackageDetails,
  LoginInstructions,
  SpamWarning,
} from "../../email-components";

export const MedSpaCMSEmail = (props: {
  variables: RaiResponse & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a Medicaid SPA RAI Response
        Submission:
      </p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "Medicaid SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
        attachments={variables.attachments}
      />
      <SpamWarning />
    </Html>
  );
};

const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaCMSEmail
      variables={emailTemplateValue as RaiResponse & CommonVariables}
    />
  );
};

export default MedSpaCMSEmailPreview;
