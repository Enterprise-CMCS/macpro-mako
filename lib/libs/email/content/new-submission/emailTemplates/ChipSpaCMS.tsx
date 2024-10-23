import { emailTemplateValue } from "../data";
import { Events } from "shared-types";
import { CommonVariables } from "../../..";
import {
  Html,
  Container,
  Head,
  Body,
  Heading,
  Tailwind,
  Hr,
  Preview,
} from "@react-email/components";
import {
  LoginInstructions,
  PackageDetails,
  SpamWarning,
  EmailNav,
} from "../../email-components";
export const ChipSpaCMSEmail = (props: {
  variables: Events["NewChipSubmission"] & CommonVariables;
}) => {
  const variables = props.variables;
  const previewText = `CHIP SPA &${variables.id} Submitted`;
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body>
          <Container>
            <EmailNav appEndpointUrl={variables.applicationEndpointUrl} />
            <Heading>
              The OneMAC Submission Portal received a CHIP State Plan Amendment:
            </Heading>
            <Hr className="my-[16px] border-t-2 border-primary" />
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
      </Tailwind>
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
