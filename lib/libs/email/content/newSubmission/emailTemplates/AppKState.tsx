import { Text } from "@react-email/components";
import { CommonEmailVariables, Events } from "shared-types";
import { formatNinetyDaysDate, formatDate } from "shared-utils";
import {
  PackageDetails,
  BasicFooter,
  FollowUpNotice,
  Divider,
  MailboxNotice,
} from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const AppKStateEmail = (props: {
  variables: Events["AppKSubmission"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Appendix K Amendment Submitted`;
  const heading = "This response confirms the submission of your 1915(c) Waiver to CMS for review:";
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <Divider />
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          "Initial Waiver Number": variables.id,
          "Waiver Authority": variables.actionType,
          "Proposed Effective Date": formatDate(variables.proposedEffectiveDate),
          "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
          Summary: variables.additionalInformation,
        }}
      />
      <Divider />
      <Text style={styles.text.description}>
        {`This response confirms the receipt of your Waiver request or your
        response to a Waiver Request for Additional Information (RAI). You can
        expect a formal response to your submittal to be issued within 90 days,
        before ${formatNinetyDaysDate(variables.timestamp)}.`}
      </Text>
      <FollowUpNotice />
      <MailboxNotice type="Waiver" />
    </BaseEmailTemplate>
  );
};
