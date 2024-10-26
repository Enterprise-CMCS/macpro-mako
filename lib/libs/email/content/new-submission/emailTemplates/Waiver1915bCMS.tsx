import { DateTime } from "luxon";
import { emailTemplateValue } from "../data";
import { CommonEmailVariables, MedicaidSubmissionSchema } from "shared-types";
import {
  Html,
  Container,
  Heading,
  Head,
  Preview,
  Body,
} from "@react-email/components";
import {
  DetailsHeading,
  EmailNav,
  LoginInstructions,
  PackageDetails,
  SpamWarning,
  styles,
} from "../../email-components";

export const Waiver1915bCMSEmail = (props: {
  variables: MedicaidSubmissionSchema & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `${variables.authority} ${variables.actionType} Submitted`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <EmailNav appEndpointUrl={variables.applicationEndpointUrl} />
          <div style={styles.primarySection}>
            <Heading style={styles.h1}>
              {`The OneMAC Submission Portal received a ${variables.authority} ${variables.actionType} Submission:`}
            </Heading>
            <DetailsHeading />
            <LoginInstructions
              appEndpointURL={variables.applicationEndpointUrl}
            />
            <PackageDetails
              details={{
                "State or territory": variables.territory,
                Name: variables.submitterName,
                "Email Address": variables.submitterEmail,
                [`${variables.actionType} Number`]: variables.id,
                "Waiver Authority": variables.authority,
                "Proposed Effective Date": DateTime.fromMillis(
                  Number(variables.proposedEffectiveDate),
                ).toFormat("DDDD"),
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

// To preview with 'email-dev'
const Waiver1915bCMSEmailPreview = () => {
  return (
    <Waiver1915bCMSEmail
      variables={{
        ...emailTemplateValue,
        event: "new-medicaid-submission",
        origin: "mako",
        authority: "1915(b)",
        actionType: "Initial Waiver",
      }}
    />
  );
};

export default Waiver1915bCMSEmailPreview;
