import { CommonEmailVariables, Events } from "shared-types";
import {
  Attachments,
  DetailsHeading,
  LoginInstructions,
  PackageDetails,
  BasicFooter,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { formatDate, formatActionType } from "shared-utils";

export const Waiver1915bCMSEmail = (props: {
  variables:
    | (Events["CapitatedInitial"] & CommonEmailVariables)
    | (Events["ContractingInitial"] & CommonEmailVariables)
    | (Events["CapitatedRenewal"] & CommonEmailVariables)
    | (Events["ContractingRenewal"] & CommonEmailVariables)
    | (Events["CapitatedAmendment"] & CommonEmailVariables)
    | (Events["ContractingAmendment"] & CommonEmailVariables);
}) => {
  const variables = props.variables;
  const previewText = `${variables.authority} ${formatActionType(variables.actionType)} Submitted`;
  const heading = `The OneMAC Submission Portal received a ${
    variables.authority
  } ${formatActionType(variables.actionType)} waiver submission:`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <DetailsHeading />
      <LoginInstructions appEndpointURL={variables.applicationEndpointUrl} />
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
