import { CommonEmailVariables, Events } from "shared-types";

import {
  Attachments,
  BasicFooter,
  PackageDetails,
  SubDocHowToAccess,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const chipPrefix = `CHIP${variables.chipEligibility ? " Eligibility" : ""}`;

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
      <Attachments attachments={variables.attachments} />
      <SubDocHowToAccess appEndpointURL={variables.applicationEndpointUrl} />
    </BaseEmailTemplate>
  );
};
