import * as React from "react";
import { DateTime } from "luxon";
import { emailTemplateValue } from "../data";
import { OneMac } from "shared-types";
import { CommonVariables } from "../../..";
import { Html } from "@react-email/components";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
} from "../../email-components";

export const Waiver1915bCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a {variables.authority}{" "}
        {variables.actionType} Submission:
      </p>
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
    </Html>
  );
};

// To preview with 'email-dev'
const Waiver1915bCMSEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={emailTemplateValue as OneMac & CommonVariables}
    />
  );
};

export default Waiver1915bCMSEmailPreview;
