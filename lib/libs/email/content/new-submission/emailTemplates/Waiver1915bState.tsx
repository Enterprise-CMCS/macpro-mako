import { CommonEmailVariables, Events } from "shared-types";
import { formatNinetyDaysDate, formatDate, formatActionType } from "shared-utils";
import { Text } from "@react-email/components";
import {
  PackageDetails,
  FollowUpNotice,
  DetailsHeading,
  MailboxNotice,
  BasicFooter,
} from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const Waiver1915bStateEmail = (props: {
  variables:
    | (Events["CapitatedInitial"] & CommonEmailVariables)
    | (Events["ContractingInitial"] & CommonEmailVariables);
}) => {
  const variables = props.variables;
  const previewText = `${variables.authority} ${formatActionType(variables.actionType)} Submitted`;
  const heading = `This response confirms the submission of your ${
    variables.authority
  } ${formatActionType(variables.actionType)} waiver to CMS for review:`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <DetailsHeading />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${formatActionType(variables.actionType)} Waiver Number`]: variables.id,
          "Waiver Authority": variables.authority,
          "Proposed Effective Date": formatDate(variables.proposedEffectiveDate),
          "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={{ ...styles.text, marginTop: "16px" }}>
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
