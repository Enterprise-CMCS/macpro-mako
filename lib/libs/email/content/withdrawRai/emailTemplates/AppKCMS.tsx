import React from "react";
import { Container, Html } from "@react-email/components";
import { WithdrawRAI, PackageDetails, BasicFooter } from "../../email-components";
import { EmailProps } from "./index";

export const AppKCMSEmail: React.FC<EmailProps> = ({ variables, relatedEvent }) => {
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
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "Waiver Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <BasicFooter />
      </Container>
    </Html>
  );
};
