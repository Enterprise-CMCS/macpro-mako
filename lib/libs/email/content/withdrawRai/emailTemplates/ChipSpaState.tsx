import { CommonEmailVariables, Events } from "shared-types";
import { Container, Html } from "@react-email/components";
import { WithdrawRAI, PackageDetails, FollowUpNotice } from "../../email-components";

export const ChipSpaStateEmail = (props: {
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
            "CHIP SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <FollowUpNotice isChip />
      </Container>
    </Html>
  );
};
