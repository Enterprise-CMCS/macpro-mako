import { CommonEmailVariables, Events } from "shared-types";
import {
  Attachments,
  LoginInstructions,
  PackageDetails,
  BasicFooter,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { formatDate, formatActionTypeWithWaiver } from "shared-utils";

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
  const heading = `The OneMAC Submission Portal received a ${
    variables.authority
  } ${formatActionTypeWithWaiver(variables.actionType)} Submission:`;
  return (
    <BaseEmailTemplate
      previewText={`${variables.authority} ${formatActionTypeWithWaiver(variables.actionType)} Submitted`}
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
          [`${formatActionTypeWithWaiver(variables.actionType)} Number`]: variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": formatDate(variables.proposedEffectiveDate),
          Summary: variables.additionalInformation,
        }}
      />
      <Attachments attachments={variables.attachments} />
    </BaseEmailTemplate>
  );
};
