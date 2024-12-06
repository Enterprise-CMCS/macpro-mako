import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, Attachments, BasicFooter, Divider } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const ChipSpaStateEmail = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const previewText = `Additional documents submitted for CHIP SPA ${variables.id}`;
  const heading = `You’ve successfully submitted the following to CMS reviewers for CHIP SPA ${variables.id}`;

  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <Divider />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        If you have questions or did not expect this email, please contact your CPOC.
      </Text>
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>Thank you.</Text>
    </BaseEmailTemplate>
  );
};
