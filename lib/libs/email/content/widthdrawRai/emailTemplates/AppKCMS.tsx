import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonVariables } from "../../..";
import { RaiWithdraw } from "shared-types";
import { Html } from "@react-email/components";
import {
  WithdrawRAI,
  PackageDetails,
  SpamWarning,
} from "../../email-components";

export const AppKCMSEmail = (props: {
  variables: RaiWithdraw & CommonVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <WithdrawRAI {...variables} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: relatedEvent.submitterName,
          "Email Address": relatedEvent.submitterEmail,
          "Waiver Number": variables.id,
          Summary: variables.additionalInformation,
        }}
        attachments={variables.attachments}
      />
      <SpamWarning />
    </Html>
  );
};

export const relatedEvent = {
  submitterName: "George",
  submitterEmail: "test@email.com",
};

const AppKCMSEmailPreview = () => {
  return (
    <AppKCMSEmail
      relatedEvent={relatedEvent}
      variables={emailTemplateValue as RaiWithdraw & CommonVariables}
    />
  );
};

export default AppKCMSEmailPreview;
