import { emailTemplateValue } from "../data";
import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import {
  Html,
  Container,
  Head,
  Body,
  Heading,
  Preview,
} from "@react-email/components";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
  EmailNav,
  styles,
  DetailsHeading,
} from "../../email-components";

export const ChipSpaCMSEmail = (props: {
  variables: Events["NewChipSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `CHIP SPA ${variables.id} Submitted`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <EmailNav appEndpointUrl={variables.applicationEndpointUrl} />
          <div style={styles.primarySection}>
            <Heading style={styles.h1}>
              The OneMAC Submission Portal received a CHIP State Plan Amendment:
            </Heading>
            <DetailsHeading />
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
          </div>
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
        authority: "CHIP SPA",
        event: "new-chip-submission",
        actionType: "Amend",
        origin: "mako",
      }}
    />
  );
};

export default ChipSpaCMSEmailPreview;
