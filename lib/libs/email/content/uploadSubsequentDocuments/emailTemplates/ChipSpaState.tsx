import { Text } from "@react-email/components";
import { Events } from "shared-types";
import { CommonEmailVariables } from "shared-types";

import { Attachments, BasicFooter, Divider, PackageDetails } from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaStateEmail = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const chipPrefix = `CHIP${variables.chipEligibility ? " Eligibility" : ""}`;

  return (
    <BaseEmailTemplate
      previewText={`Additional documents submitted for ${chipPrefix} SPA ${variables.id}`}
      heading={`You've successfully submitted the following to CMS reviewers for ${chipPrefix} SPA ${variables.id}:`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${chipPrefix} SPA Package ID`]: variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <Divider />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        If you have questions or did not expect this email, please contact your CPOC. $
        <pre>{JSON.stringify(variables, null, 2)}</pre>
      </Text>
    </BaseEmailTemplate>
  );
};
