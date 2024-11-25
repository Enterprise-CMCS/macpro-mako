import { CommonEmailVariables, Events } from "shared-types";
import { Html, Container } from "@react-email/components";
import { PackageDetails, LoginInstructions, BasicFooter } from "../../email-components";

export const WaiverCMSEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          The OneMAC Submission Portal received a {variables.authority} Waiver RAI Response
          Submission:
        </h3>
        <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            "Email Address": variables.submitterEmail,
            "Waiver Number": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <BasicFooter />
      </Container>
    </Html>
  );
};
