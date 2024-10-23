import { Events } from "shared-types";
import { CommonVariables, formatDate, formatNinetyDaysDate } from "../../..";
import {
  Html,
  Container,
  Heading,
  Text,
  Tailwind,
  Head,
  Preview,
  Body,
} from "@react-email/components";
import {
  PackageDetails,
  MailboxSPA,
  ContactStateLead,
  EmailNav,
} from "../../email-components";

export const MedSpaStateEmail = (props: {
  variables: Events["NewMedicaidSubmission"] & CommonVariables;
}) => {
  const variables = props.variables;
  const previewText = `Medicaid SPA &${variables.id} Submitted`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body>
          <Container>
            <EmailNav appEndpointUrl={variables.applicationEndpointUrl} />
            <Heading>
              This response confirms that you submitted a Medicaid SPA to CMS
              for review:
            </Heading>
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
            <Text>
              This response confirms the receipt of your Medicaid State Plan
              Amendment (SPA or your response to a SPA Request for Additional
              Information (RAI)). You can expect a formal response to your
              submittal to be issued within 90 days, before{" "}
              {formatNinetyDaysDate(variables.timestamp)}.
            </Text>
            <MailboxSPA />
            <ContactStateLead />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
