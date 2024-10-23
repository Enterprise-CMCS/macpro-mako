import { emailTemplateValue } from "../data";
import { Events } from "shared-types";
import { CommonVariables } from "../../..";
import {
  Html,
  Container,
  Head,
  Body,
  Heading,
  Hr,
  Preview,
} from "@react-email/components";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
  EmailNav,
  styles,
} from "../../email-components";
export const ChipSpaCMSEmail = (props: {
  variables: Events["NewChipSubmission"] & CommonVariables;
}) => {
  const variables = props.variables;
  const previewText = `CHIP SPA &${variables.id} Submitted`;
  return (
    <Html>
      <Head style={styles.main} />
      <Preview>{previewText}</Preview>
      <Body>
        <Container style={styles.container}>
          <EmailNav appEndpointUrl={variables.applicationEndpointUrl} />
          <Heading style={styles.heading}>
            The OneMAC Submission Portal received a CHIP State Plan Amendment:
          </Heading>
          <Hr style={{ margin: "16px 0", borderTop: "2px solid #0071BD" }} />
          <LoginInstructions
            appEndpointURL={variables.applicationEndpointUrl}
          />
          <PackageDetails
            details={{
              "State or territory": variables.territory,
              Name: variables.submitterName,
              Email: variables.submitterEmail,
              "CHIP SPA Package ID": variables.id,
              Summary: variables.additionalInformation,
            }}
            attachments={variables.attachments}
          />
          <SpamWarning />
        </Container>
      </Body>
    </Html>
  );
};

// To preview with on 'email-dev'
const ChipSpaCMSEmailPreview = () => {
  return (
    <ChipSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        event: "new-chip-submission",
        actionType: "Amend",
        origin: "mako",
      }}
    />
  );
};

export default ChipSpaCMSEmailPreview;
