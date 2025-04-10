import { Text } from "@react-email/components";
import { CommonEmailVariables, Events } from "shared-types";
import { formatDate, formatNinetyDaysDate } from "shared-utils";

import {
  BasicFooter,
  Divider,
  FollowUpNotice,
  MailboxNotice,
  PackageDetails,
} from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

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
          "Amendment Waiver Number": variables.id,
          "Waiver Authority": variables.authority,
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
      <MailboxNotice type="Waiver" />
      <FollowUpNotice includeDidNotExpect={false} />
    </BaseEmailTemplate>
  );
};
