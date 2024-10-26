import { DateTime } from "luxon";
import {
  Html,
  Container,
  Head,
  Preview,
  Text,
  Body,
  Heading,
} from "@react-email/components";
import { CommonEmailVariables, Events } from "shared-types";
import { formatNinetyDaysDate } from "../../..";
import {
  PackageDetails,
  ContactStateLead,
  MailboxWaiver,
  styles,
  EmailNav,
  DetailsHeading,
} from "../../email-components";
import { emailTemplateValue } from "../data";

export const AppKStateEmail = (props: {
  variables: Events["NewAppKSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Appendix K Amendment Submitted`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <EmailNav appEndpointUrl={variables.applicationEndpointUrl} />
          <div style={styles.primarySection}>
            <Heading style={styles.h1}>
              This response confirms the submission of your 1915(c) Waiver to
              CMS for review:
            </Heading>
            <DetailsHeading />
            <PackageDetails
              details={{
                "State or territory": variables.territory,
                Name: variables.submitterName,
                "Email Address": variables.submitterEmail,
                "Initial Waiver Numbers": variables.waiverIds.join(", "),
                "Waiver Authority": variables.seaActionType,
                "Proposed Effective Date": DateTime.fromMillis(
                  Number(variables.proposedEffectiveDate),
                ).toFormat("DDDD"),
                "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
                Summary: variables.additionalInformation,
              }}
              attachments={variables.attachments}
            />
            <Text style={styles.text}>
              This response confirms the receipt of your Waiver request or your
              response to a Waiver Request for Additional Information (RAI). You
              can expect a formal response to your submittal to be issued within
              90 days, before ${formatNinetyDaysDate(variables.timestamp)}.
            </Text>
            <MailboxWaiver />
            <ContactStateLead />
          </div>
        </Container>
      </Body>
    </Html>
  );
};

// To preview with on 'email-dev'
const AppKStateEmailPreview = () => {
  return (
    <AppKStateEmail
      variables={{
        ...emailTemplateValue,
        origin: "mako",
        state: "CO",
        waiverIds: ["1234-56768", "1234-56769"],
        actionType: "Amend",
        seaActionType: "Amend",
        title: "App K Title",
      }}
    />
  );
};

export default AppKStateEmailPreview;
