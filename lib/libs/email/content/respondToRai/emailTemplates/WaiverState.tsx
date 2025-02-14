import { formatActionType, formatNinetyDaysDate } from "shared-utils";
import { CommonEmailVariables, Events } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, MailboxNotice, BasicFooter, FollowUpNotice } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const WaiverStateEmail = ({
  variables,
}: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Your ${variables.authority} RAI Response for ${variables.id} has been submitted to CMS`}
    heading={`This response confirms the submission of your ${formatActionType(variables.actionType)} RAI Response to CMS for review:`}
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "Initial Waiver Number": variables.id,
        "Waiver Authority": variables.authority,
        "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
        Summary: variables.additionalInformation,
      }}
    />
    <Text style={styles.text.description}>
      {`This response confirms the receipt of your Waiver request or your response to a Waiver
        Request for Additional Information (RAI). You can expect a formal response to your submittal
        to be issued within 90 days, before ${formatNinetyDaysDate(variables.timestamp)}.`}
    </Text>
    <MailboxNotice type="Waiver" onWaivers />
    <FollowUpNotice includeDidNotExpect={false} withDivider={false} />
  </BaseEmailTemplate>
);
