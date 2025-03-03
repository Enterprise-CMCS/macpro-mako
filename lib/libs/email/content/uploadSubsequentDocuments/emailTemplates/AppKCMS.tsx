import { CommonEmailVariables, Events } from "shared-types";
import {
  Attachments,
  BasicFooter,
  PackageDetails,
  SubDocHowToAccess,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const AppKCMSEmail = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Action required: review new documents for 1915(c) ${variables.actionType} ${variables.id} in OneMAC`}
    heading={`New documents have been submitted for 1915(c) ${variables.actionType} in OneMAC.`}
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
