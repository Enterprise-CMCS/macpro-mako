import { CommonEmailVariables, Events } from "shared-types";
import { PackageDetails, BasicFooter, Attachments } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";
import { Text } from "@react-email/components";

export const MedSpaCMSEmail = (props: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  //subject
  const previewText = `Medicaid SPA ${variables.id}`;
  // start of body
  const heading = `New documents have been submitted for Medicaid SPA ${variables.id} in OneMAC.`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          "Medicaid SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <Text style={{ ...styles.text.base, marginTop: "16px", fontWeight: "bold" }}>
        How to Access:
      </Text>
      <Text style={{ ...styles.text.base, marginTop: "16px", marginLeft: "16px" }}>
        • These documents can be found in OneMAC through this link
        <a href={variables.applicationEndpointUrl} target="_blank">
          {variables.applicationEndpointUrl}
        </a>
      </Text>
      <Text style={{ ...styles.text.base, marginTop: "16px", marginLeft: "16px" }}>
        • If you are not already logged in, click “Login” at the top of the page and log in using
        your Enterprise User Administration (EUA) credentials.
      </Text>
      <Text style={{ ...styles.text.base, marginTop: "16px", marginLeft: "16px" }}>
        • After you logged in, click the submission ID number on the dashboard page to view details.
      </Text>
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>Thank you.</Text>
    </BaseEmailTemplate>
  );
};
