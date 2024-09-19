import * as React from "react";
import { emailTemplateValue } from "../data";
import { OneMac } from "shared-types";
import { CommonVariables } from "../../..";
import { DateTime } from "luxon";
import { Html } from "@react-email/components";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
} from "../../email-components";

// 1915c - app K
export const AppKCMSEmail = (props: {
  variables: OneMac & CommonVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <p>
        The OneMAC Submission Portal received a 1915(c) Appendix K Amendment
        Submission:
      </p>
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Amendment Title": variables.appkTitle ?? null,
          "Waiver Amendment Number": variables.id,
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

// To preview with on 'email-dev'
const AppKCMSEmailPreview = () => {
  return (
    <AppKCMSEmail variables={emailTemplateValue as OneMac & CommonVariables} />
  );
};

export default AppKCMSEmailPreview;
