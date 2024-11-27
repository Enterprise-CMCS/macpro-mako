import { CommonEmailVariables } from "shared-types";
import { WithdrawPackage } from "shared-types";
import { Html, Container } from "@react-email/components";
import { PackageDetails, BasicFooter } from "../../email-components";

export const MedSpaCMSEmail = (props: { variables: WithdrawPackage & CommonEmailVariables }) => {
  const variables = props.variables;
  return (
    <Html
      lang="en"
      dir="ltr"
    >
      <Container>
        <h3>
          The OneMAC Submission Portal received a request to withdraw the package below. The package
          will no longer be considered for CMS review:
        </h3>
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            Email: variables.submitterEmail,
            "Medicaid SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <BasicFooter />
      </Container>
    </Html>
  );
};
