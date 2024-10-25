import { emailTemplateValue } from "../data";
import { Events, CommonEmailVariables } from "shared-types";
import { DateTime } from "luxon";
import {
  Html,
  Container,
  Heading,
  Hr,
  Section,
  Body,
  Head,
  Preview,
} from "@react-email/components";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
  styles,
  EmailNav,
} from "../../email-components";

// 1915c - app K
export const AppKCMSEmail = (props: {
  variables: Events["NewAppKSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Appendix K Amendment Submitted `;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <EmailNav appEndpointUrl={variables.applicationEndpointUrl} />
          <Section style={styles.upperSection}>
            <Heading style={styles.h1}>
              The OneMAC Submission Portal received a 1915(c) Appendix K
              Amendment Submission:
            </Heading>
            <Hr style={styles.divider} />
            <LoginInstructions
              appEndpointURL={variables.applicationEndpointUrl}
            />
            <PackageDetails
              details={{
                "State or territory": variables.territory,
                Name: variables.submitterName,
                "Email Address": variables.submitterEmail,
                "Amendment Title": variables.title ?? null,
                "Waiver Amendment Number": variables.id,
                "Waiver Authority": variables.seaActionType,
                "Proposed Effective Date": DateTime.fromMillis(
                  Number(variables.proposedEffectiveDate),
                ).toFormat("DDDD"),
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
const AppKCMSEmailPreview = () => {
  return (
    <AppKCMSEmail
      variables={{
        ...emailTemplateValue,
        seaActionType: "Amend",
        title: "Title",
        waiverIds: ["123"],
        state: "State",
        origin: "mako",
      }}
    />
  );
};

export default AppKCMSEmailPreview;
