import { Text } from "@react-email/components";
import { CommonEmailVariables, Events } from "shared-types";

import {
  Attachments,
  BasicFooter,
  PackageDetails,
  SubDocHowToAccess,
} from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const chipPrefix = `CHIP${variables.isChipEligibility ? " Eligibility" : ""}`;

  return (
    <BaseEmailTemplate
      previewText={`Action required: review new documents for ${chipPrefix} SPA ${variables.id} in OneMAC`}
      heading={`New documents have been submitted for ${chipPrefix} SPA ${variables.id} in OneMAC.`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          [`${chipPrefix} SPA Package ID`]: variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        If you have questions or did not expect this email, please contact your CPOC. $
        <pre>{JSON.stringify(variables, null, 2)}</pre>
      </Text>
      <Attachments attachments={variables.attachments} />
      <SubDocHowToAccess appEndpointURL={variables.applicationEndpointUrl} />
    </BaseEmailTemplate>
  );
};
