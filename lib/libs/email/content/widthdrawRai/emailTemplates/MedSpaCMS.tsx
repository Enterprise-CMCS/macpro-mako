import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonEmailVariables } from "../../..";
import { RaiWithdraw } from "shared-types";
import { Container, Html } from "@react-email/components";
import {
  WithdrawRAI,
  PackageDetails,
  SpamWarning,
} from "../../email-components";
import { relatedEvent } from "./AppKCMS";

export const MedSpaCMSEmail = (props: {
  variables: RaiWithdraw & CommonEmailVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <WithdrawRAI {...variables} />
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: relatedEvent.submitterName,
            "Email Address": relatedEvent.submitterEmail,
            "SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
          attachments={variables.attachments}
        />
        <SpamWarning />
      </Container>
    </Html>
  );
};

const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaCMSEmail
      relatedEvent={relatedEvent}
      variables={emailTemplateValue as RaiWithdraw & CommonEmailVariables}
    />
  );
};

export default MedSpaCMSEmailPreview;
