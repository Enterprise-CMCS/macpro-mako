import { formatNinetyDaysDate } from "shared-utils";
import { CommonEmailVariables, Events } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, MailboxNotice, FollowUpNotice, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const MedSpaStateEmail = ({
  variables,
}: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`Your Medicaid SPA RAI Response for ${variables.id} has been submitted to CMS`}
    heading="This response confirms you submitted a Medicaid SPA RAI Response to CMS for review:"
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "Medicaid SPA ID": variables.id,
        "90th Day Deadline": formatNinetyDaysDate(variables.responseDate),
        Summary: variables.additionalInformation,
      }}
    />
    <Text style={styles.text.description}>
      {`This response confirms receipt of your Medicaid State Plan Amendment (SPA or your response to a SPA Request for Additional Information (RAI)). You can expect a formal response to your submittal to be issued within 90 days, before ${formatNinetyDaysDate(variables.responseDate)}.`}
    </Text>
    <MailboxNotice type="SPA" />
    <FollowUpNotice withDivider={false} includeDidNotExpect={false} />
  </BaseEmailTemplate>
);
