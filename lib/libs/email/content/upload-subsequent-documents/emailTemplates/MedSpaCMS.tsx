import { CommonEmailVariables, Events } from "shared-types";
import {
  PackageDetails,
  BasicFooter,
  Attachments,
  SubDocHowToAccess,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const MedSpaCMSEmail = (props: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  //subject
  const previewText = `Medicaid SPA ${variables.id}`;
  // start of body
  const heading = `New documents have been submitted for Medicaid SPA ${variables.id} in OneMAC.`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or territory": variables.territory,
          "Medicaid SPA Package ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <SubDocHowToAccess appEndpointURL={variables.applicationEndpointUrl} />
    </BaseEmailTemplate>
  );
};
