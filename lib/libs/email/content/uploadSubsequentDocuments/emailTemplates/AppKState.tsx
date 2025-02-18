import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, Attachments, BasicFooter, Divider } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const AppKStateEmail = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Additional documents submitted for 1915(c) ${variables.id}`}
    heading={`You've successfully submitted the following to CMS reviewers for 1915(c) ${variables.id}`}
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "1915(c) Appendix K ID": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <Attachments attachments={variables.attachments} />
    <Divider />
    <Text style={{ ...styles.text.base, marginTop: "16px" }}>
      If you have questions or did not expect this email, please contact your CPOC.
    </Text>
  </BaseEmailTemplate>
);
