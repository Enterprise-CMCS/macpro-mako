import { Text } from "@react-email/components";
import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";

import { Attachments, BasicFooter, Divider, PackageDetails } from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const AppKStateEmail = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Additional documents submitted for 1915(c) ${variables.actionType} Waiver ${variables.id}`}
    heading={`You've successfully submitted the following to CMS reviewers for 1915(c) ${variables.actionType} Waiver ${variables.id}:`}
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
