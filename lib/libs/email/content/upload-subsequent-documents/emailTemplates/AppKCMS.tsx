import { CommonEmailVariables, Events } from "shared-types";
import {
  PackageDetails,
  BasicFooter,
  Attachments,
  SubDocHowToAccess,
  Divider,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const AppKCMSEmail = (props: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Action required: review new documents for 1915(c) ${variables.id} in OneMAC.`;
  const heading = `New documents have been submitted for 1915(c) ${variables.id} in OneMAC.`;
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
          "1915(c) Appendix K ID": variables.id,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
      <SubDocHowToAccess appEndpointURL={variables.applicationEndpointUrl} />
    </BaseEmailTemplate>
  );
};
