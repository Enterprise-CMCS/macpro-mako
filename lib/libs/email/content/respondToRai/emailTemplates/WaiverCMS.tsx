import { CommonEmailVariables, Events } from "shared-types";

import {
  Attachments,
  BasicFooter,
  LoginInstructions,
  PackageDetails,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverCMSEmail = ({
  variables,
}: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Waiver RAI Response for ${variables.id} Submitted`}
    heading={`The OneMAC Submission Portal received a(n) ${variables.actionType} Waiver RAI Response Submission:`}
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "Waiver Number": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <Attachments attachments={variables.attachments} />
  </BaseEmailTemplate>
);
