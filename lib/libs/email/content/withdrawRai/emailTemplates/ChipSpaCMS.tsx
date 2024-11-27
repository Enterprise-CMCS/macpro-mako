import { CommonEmailVariables } from "shared-types";
import { RaiWithdraw } from "shared-types";
import { Container, Html } from "@react-email/components";
import { WithdrawRAI, PackageDetails, BasicFooter } from "../../email-components";

export const ChipSpaCMSEmail = (props: {
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
            "CHIP SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <BasicFooter />
      </Container>
    </Html>
  );
};
