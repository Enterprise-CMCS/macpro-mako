import { Events, CommonEmailVariables } from "shared-types";
import {
  LoginInstructions,
  PackageDetails,
  Attachments,
  BasicFooter,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverCMSEmail = (props: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <BaseEmailTemplate
      previewText="Appendix K Amendment Submitted"
      heading={`The OneMAC Submission Portal received a ${variables.authority} Waiver RAI Response
          Submission:`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <h3></h3>
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
};
