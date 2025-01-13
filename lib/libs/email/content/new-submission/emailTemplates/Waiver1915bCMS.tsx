import { CommonEmailVariables, Events } from "shared-types";
import {
  Attachments,
  LoginInstructions,
  PackageDetails,
  BasicFooter,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { formatDate, formatActionType } from "shared-utils";

export const Waiver1915bCMSEmail = (props: {
  variables:
    | (Events["CapitatedInitial"] & CommonEmailVariables)
    | (Events["ContractingInitial"] & CommonEmailVariables);
}) => {
  const variables = props.variables;
  const previewText = `${variables.authority} ${variables.actionType} Submitted`;
  const heading = `The OneMAC Submission Portal received a ${
    variables.authority
  } ${formatActionType(variables.actionType)} waiver Submission:`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} useThisLink />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${formatActionType(variables.actionType)} Waiver Number`]: variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": formatDate(variables.proposedEffectiveDate),
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
