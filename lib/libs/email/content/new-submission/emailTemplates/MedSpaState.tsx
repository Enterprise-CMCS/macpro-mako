import { Events } from "shared-types";
import { formatDate, formatNinetyDaysDate } from "../../..";
import { CommonEmailVariables } from "shared-types";
import {
  Html,
  Container,
  Heading,
  Text,
  Head,
  Preview,
  Body,
  Hr,
  Section,
} from "@react-email/components";
import {
  PackageDetails,
  MailboxSPA,
  ContactStateLead,
  EmailNav,
  styles,
} from "../../email-components";
import { emailTemplateValue } from "../data";

export const MedSpaStateEmail = (props: {
  variables: Events["NewMedicaidSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Medicaid SPA &${variables.id} Submitted`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <EmailNav appEndpointUrl={variables.applicationEndpointUrl} />
          <Section style={styles.upperSection}>
            <Heading style={styles.h1}>
              This response confirms that you submitted a Medicaid SPA to CMS
              for review:
            </Heading>
            <Hr style={styles.divider} />
            <PackageDetails
              details={{
                "State or territory": variables.territory,
                Name: variables.submitterName,
                "Email Address": variables.submitterEmail,
                "Medicaid SPA ID": variables.id,
                "Proposed Effective Date": formatDate(
                  variables.proposedEffectiveDate,
                ),
                "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
                Summary: variables.additionalInformation,
              }}
              attachments={variables.attachments}
            />
            <Section style={styles.primarySection}>
              <Text style={styles.text}>
                This response confirms the receipt of your Medicaid State Plan
                Amendment (SPA or your response to a SPA Request for Additional
                Information (RAI)). You can expect a formal response to your
                submittal to be issued within 90 days, before{" "}
                {formatNinetyDaysDate(variables.timestamp)}.
              </Text>
              <MailboxSPA />
            </Section>
          </Section>
          <ContactStateLead />
        </Container>
      </Body>
    </Html>
  );
};

const MedSpaStateEmailPreview = () => {
  return (
    <MedSpaStateEmail
      variables={{
        ...emailTemplateValue,
        origin: "mako",
        event: "new-medicaid-submission",
      }}
    />
  );
};

export default MedSpaStateEmailPreview;
