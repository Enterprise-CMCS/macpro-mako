import { Text } from "@react-email/components";
import { CommonEmailVariables, Events } from "shared-types";
import { formatActionTypeWithWaiver, formatDate, formatNinetyDaysDate } from "shared-utils";

import { BasicFooter, FollowUpNotice, MailboxNotice, PackageDetails } from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const Waiver1915bStateEmail = (props: {
  variables:
    | (Events["CapitatedInitial"] & CommonEmailVariables)
    | (Events["CapitatedRenewal"] & CommonEmailVariables)
    | (Events["CapitatedAmendment"] & CommonEmailVariables)
    | (Events["ContractingInitial"] & CommonEmailVariables)
    | (Events["ContractingRenewal"] & CommonEmailVariables)
    | (Events["ContractingAmendment"] & CommonEmailVariables);
}) => {
  const variables = props.variables;
  const heading = `This response confirms the submission of your ${
    variables.authority
  } ${formatActionTypeWithWaiver(variables.actionType)} to CMS for review:`;
  return (
    <BaseEmailTemplate
      previewText={`${variables.authority} ${formatActionTypeWithWaiver(variables.actionType)} Submitted`}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${formatActionTypeWithWaiver(variables.actionType)} Number`]: variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": formatDate(variables.proposedEffectiveDate),
          "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        {`This response confirms the receipt of your Waiver request or your response to a Waiver Request for Additional Information (RAI). You
              can expect a formal response to your submittal to be issued within
              90 days, before
              ${formatNinetyDaysDate(variables.timestamp)}
              .`}
      </Text>
      <MailboxNotice type="Waiver" />
      <FollowUpNotice includeDidNotExpect={false} />
    </BaseEmailTemplate>
  );
};
