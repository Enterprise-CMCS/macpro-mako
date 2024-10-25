import { emailTemplateValue } from "../data";
import { MedicaidSubmissionSchema } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import {
  Html,
  Container,
  Heading,
  Section,
  Head,
  Preview,
  Text,
  Body,
} from "@react-email/components";
import {
  PackageDetails,
  ContactStateLead,
  EmailNav,
  styles,
  DetailsHeading,
} from "../../email-components";

export const ChipSpaStateEmail = (props: {
  variables: MedicaidSubmissionSchema & CommonEmailVariables;
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
          <Section>
            <div style={styles.primarySection}>
              <Heading style={styles.h1}>
                This is confirmation that you submitted a CHIP State Plan
                Amendment to CMS for review:
              </Heading>
              <DetailsHeading />
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

              <Text style={{ ...styles.text, marginTop: "16px" }}>
                This response confirms the receipt of your CHIP State Plan
                Amendment (CHIP SPA). You can expect a formal response to your
                submittal from CMS at a later date.
              </Text>
            </div>
          </Section>
          <ContactStateLead isChip />
        </Container>
      </Body>
    </Html>
  );
};

// to preview on 'email-dev'
const ChipSpaStateEmailPreview = () => {
  return (
    <ChipSpaStateEmail
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

export default ChipSpaStateEmailPreview;
