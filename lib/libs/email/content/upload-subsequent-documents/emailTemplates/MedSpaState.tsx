import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, Attachments, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const MedSpaStateEmail = (props: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const variables = props.variables;

  return (
    <BaseEmailTemplate
      previewText={`Additional documents submitted for Medicaid SPA ${variables.id}`}
      heading={`You’ve successfully submitted the following to CMS reviewers for Medicaid SPA ${variables.id}`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Medicaid SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        If you have questions or did not expect this email, please contact your CPOC.
      </Text>
    </BaseEmailTemplate>
  );
};
