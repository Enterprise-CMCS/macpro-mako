import { CommonEmailVariables, Events } from "shared-types";
import { PackageDetails, BasicFooter, Attachments, Divider } from "../../email-components";
import { styles } from "../../email-styles";
import { Text } from "@react-email/components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiversEmailState = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Action required: review new documents for 1915(b) ${variables.actionType} ${variables.id}`}
    heading={`You've successfully submitted the following to CMS reviewers for 1915(b) ${variables.actionType} ${variables.id}:`}
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "Waiver Package ID": variables.id,
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
