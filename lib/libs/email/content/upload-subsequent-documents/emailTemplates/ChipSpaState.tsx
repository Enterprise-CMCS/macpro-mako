import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";
import { Text } from "@react-email/components";
import {
  PackageDetails,
  ContactStateLead,
  DetailsHeading,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const ChipSpaStateEmail = (props: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Additional documents submitted for CHIP SPA ${variables.id}`;
  const heading = `You’ve successfully submitted the following to CMS reviewers for CHIP SPA ${variables.id}`;

  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<ContactStateLead isChip />}
    >
      <DetailsHeading />
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          Name: variables.submitterName,
          Email: variables.submitterEmail,
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        If you have questions or did not expect this email, please contact your CPOC.
      </Text>
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>Thank you.</Text>
    </BaseEmailTemplate>
  );
};
