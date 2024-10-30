import { emailTemplateValue } from "../data";
import { CommonEmailVariables } from "shared-types";
import { RaiResponse } from "shared-types";
import { Container, Html } from "@react-email/components";
import {
  PackageDetails,
  LoginInstructions,
  BasicFooter,
  Attachments,
} from "../../email-components";

export const MedSpaCMSEmail = (props: {
  variables: RaiResponse & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <Html lang="en" dir="ltr">
      <Container>
        <h3>
          The OneMAC Submission Portal received a Medicaid SPA RAI Response
          Submission:
        </h3>
        <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
        <PackageDetails
          details={{
            "State or territory": variables.territory,
            Name: variables.submitterName,
            Email: variables.submitterEmail,
            "Medicaid SPA Package ID": variables.id,
            Summary: variables.additionalInformation,
          }}
        />
        <Attachments attachments={variables.attachments as any} />
        <BasicFooter />
      </Container>
    </Html>
  );
};

const MedSpaCMSEmailPreview = () => {
  return <MedSpaCMSEmail variables={emailTemplateValue as any} />;
};

export default MedSpaCMSEmailPreview;
