import { CommonEmailVariables } from "shared-types";
import { RaiWithdraw } from "shared-types";
import { Container, Html } from "@react-email/components";
import { WithdrawRAI, PackageDetails, ContactStateLead } from "../../email-components";

export const MedSpaStateEmail = (props: {
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
            "Medicaid SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <ContactStateLead />
      </Container>
    </Html>
  );
};
