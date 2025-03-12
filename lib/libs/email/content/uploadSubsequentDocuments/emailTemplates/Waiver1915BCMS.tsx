import { CommonEmailVariables, Events } from "shared-types";

import {
  Attachments,
  BasicFooter,
  PackageDetails,
  SubDocHowToAccess,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiversEmailCMS = ({
  variables,
}: {
  variables: Events["UploadSubsequentDocuments"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Action required: review new documents for 1915(b) ${variables.actionType} Waiver in OneMAC`}
    heading={`New documents have been submitted for 1915(b) ${variables.actionType} Waiver in OneMAC.`}
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        "Waiver Package ID": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <Attachments attachments={variables.attachments} />
    <SubDocHowToAccess appEndpointURL={variables.applicationEndpointUrl} />
  </BaseEmailTemplate>
);
