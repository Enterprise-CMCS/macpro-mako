import { CommonEmailVariables, Events } from "shared-types";
import {
  PackageDetails,
  LoginInstructions,
  BasicFooter,
  Attachments,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const MedSpaCMSEmail = ({
  variables,
}: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Medicaid SPA ${variables.id} RAI Response Submitted`}
    heading="The OneMAC Submission Portal received a Medicaid SPA RAI Response Submission:"
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "Medicaid SPA Package ID": variables.id,
        Summary: variables.additionalInformation,
      }}
    />
    <Attachments attachments={variables.attachments} />
  </BaseEmailTemplate>
);
