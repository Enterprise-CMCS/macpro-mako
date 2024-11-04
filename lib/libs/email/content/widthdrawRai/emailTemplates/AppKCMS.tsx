import * as React from "react";
import { emailTemplateValue } from "../data";
import { CommonEmailVariables } from "shared-types";
import { RaiWithdraw } from "shared-types";
import { Html, Container } from "@react-email/components";
import { WithdrawRAI, PackageDetails, BasicFooter } from "../../email-components";

export const AppKCMSEmail = (props: { variables: RaiWithdraw & CommonEmailVariables; relatedEvent: any }) => {
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
            "Waiver Number": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <BasicFooter />
      </Container>
    </Html>
  );
};

export const relatedEvent = {
  submitterName: "George",
  submitterEmail: "test@email.com",
};

const AppKCMSEmailPreview = () => {
  return <AppKCMSEmail relatedEvent={relatedEvent} variables={{ ...emailTemplateValue, attachments: undefined }} />;
};

export default AppKCMSEmailPreview;
