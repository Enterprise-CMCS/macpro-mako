import { CommonEmailVariables, Events } from "shared-types";
import {
  LoginInstructions,
  PackageDetails,
  BasicFooter,
  DetailsHeading,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";
import { Text } from "@react-email/components";

export const ChipSpaCMSEmail = (props: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `${variables.id}`;
  const heading = `New documents have been submitted for  ${variables.actionType} ${variables.id} in OneMAC.`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <DetailsHeading />
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          // Name: variables.submitterName,
          // Email: variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>How to Access:</Text>
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        - These documents can be found in OneMAC through this link [insert OneMAC link/MAKO link].
      </Text>
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        - If you are not already logged in, click “Login” at the top of the page and log in using
        your Enterprise User Administration (EUA) credentials.
      </Text>
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        - After you logged in, click the submission ID number on the dashboard page to view details.
      </Text>
      Thank you.
    </BaseEmailTemplate>
  );
};
