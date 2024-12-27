import { CommonEmailVariables, Events } from "shared-types";
import {
  PackageDetails,
  BasicFooter,
  Attachments,
  SubDocHowToAccess,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaCMSEmail = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const previewText = `Action required: review new documents for CHIP SPA ${variables.id} in OneMAC.`;
  const heading = `New documents have been submitted for CHIP SPA ${variables.id} in OneMAC.`;
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
          "CHIP SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <SubDocHowToAccess appEndpointURL={variables.applicationEndpointUrl} />
    </BaseEmailTemplate>
  );
};
