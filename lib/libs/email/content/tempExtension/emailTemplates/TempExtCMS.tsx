import { CommonEmailVariables, Events } from "shared-types";

import {
  Attachments,
  BasicFooter,
  LoginInstructions,
  PackageDetails,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

type TempExtCMSEmailProps = Events["TemporaryExtension"] & CommonEmailVariables;

export const TempExtCMSEmail = (props: { variables: TempExtCMSEmailProps }) => {
  const variables = props.variables;
  const previewText = `Temporary Extension ${variables.id} Submitted`;
  const heading = `The OneMAC Submission Portal received a ${variables.authority} Waiver Extension Submission:`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} useThisLink={true} />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Temporary Extension Request Number": variables.id,
          "Temporary Extension Type": variables.authority,
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
