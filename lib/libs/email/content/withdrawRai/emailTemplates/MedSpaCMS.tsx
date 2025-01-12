import { CommonEmailVariables, Events } from "shared-types";
import { Container, Html } from "@react-email/components";
import { WithdrawRAI, PackageDetails, BasicFooter, Attachments } from "../../email-components";

export const MedSpaCMSEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
  relatedEvent: any;
}) => {
  const { variables, relatedEvent } = { ...props };
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <WithdrawRAI {...variables} relatedEvent={relatedEvent as any} />
        <PackageDetails
          details={{
            "State or Territory": variables.territory,
            Name: relatedEvent.submitterName,
            "Email Address": relatedEvent.submitterEmail,
            "SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <Attachments attachments={variables.attachments} />
        <BasicFooter />
      </Container>
    </Html>
  );
};
