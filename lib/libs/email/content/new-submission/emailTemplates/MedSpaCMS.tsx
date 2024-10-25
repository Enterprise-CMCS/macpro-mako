import { MedicaidSubmissionSchema, CommonEmailVariables } from "shared-types";
import { formatDate } from "../../..";
import {
  Html,
  Container,
  Section,
  Body,
  Head,
  Heading,
  Hr,
  Preview,
} from "@react-email/components";
import {
  EmailNav,
  LoginInstructions,
  PackageDetails,
  SpamWarning,
  styles,
} from "../../email-components";
import { emailTemplateValue } from "../data";

export const MedSpaCMSEmail = (props: {
  variables: MedicaidSubmissionSchema & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Medicaid SPA ${variables.id} Submitted`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <EmailNav appEndpointUrl={variables.applicationEndpointUrl} />
          <Section style={styles.upperSection}>
            <Heading style={styles.h1}>
              The OneMAC Submission Portal received a Medicaid SPA Submission:
            </Heading>
            <Hr style={styles.divider} />
            <LoginInstructions
              appEndpointURL={variables.applicationEndpointUrl}
            />
            <PackageDetails
              details={{
                "State or territory": variables.territory,
                Name: variables.submitterName,
                Email: variables.submitterEmail,
                "Medicaid SPA ID": variables.id,
                "Proposed Effective Date": formatDate(
                  variables.proposedEffectiveDate,
                ),
                Summary: variables.additionalInformation,
              }}
              attachments={variables.attachments}
            />
          </Section>
          <SpamWarning />
        </Container>
      </Body>
    </Html>
  );
};

// To preview with on 'email-dev'
const MedSpaCMSEmailPreview = () => {
  return (
    <MedSpaCMSEmail
      variables={{
        ...emailTemplateValue,
        authority: "Medicaid SPA",
        event: "new-medicaid-submission",
        actionType: "Amend",
        origin: "mako",
      }}
    />
  );
};

export default MedSpaCMSEmailPreview;
