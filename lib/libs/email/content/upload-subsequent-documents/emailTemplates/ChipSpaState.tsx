import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, DetailsHeading, Attachments, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const ChipSpaStateEmail = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Additional documents submitted for CHIP SPA ${variables.id}`}
    heading={`You've successfully submitted the following to CMS reviewers for CHIP SPA ${variables.id}`}
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <DetailsHeading />
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
    <Text style={{ ...styles.text.base, marginTop: "16px" }}>
      If you have questions or did not expect this email, please contact your CPOC.
    </Text>
  </BaseEmailTemplate>
);
