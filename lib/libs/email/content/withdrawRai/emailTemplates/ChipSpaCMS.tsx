import React from "react";
import { CommonEmailVariables, EmailAddresses, Events } from "shared-types";
import { Container, Html } from "@react-email/components";
import { WithdrawRAI, PackageDetails, BasicFooter } from "../../email-components";

type RelatedEventType = Events["RespondToRai"];

interface EmailProps {
  variables: Events["WithdrawRai"] & CommonEmailVariables & { emails: EmailAddresses };
  relatedEvent: RelatedEventType | null;
}

export const ChipSpaCMSEmail: React.FC<EmailProps> = ({ variables, relatedEvent }) => {
  if (!relatedEvent) {
    return <div>No related event data available.</div>;
  }

  return (
    <Html lang="en" dir="ltr">
      <Container>
        <WithdrawRAI id={variables.id} relatedEvent={relatedEvent} />
        <PackageDetails
          details={{
            "State or Territory": variables.territory,
            Name: relatedEvent.submitterName,
            "Email Address": relatedEvent.submitterEmail,
            "CHIP SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <BasicFooter />
      </Container>
    </Html>
  );
};
