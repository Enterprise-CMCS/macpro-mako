import { formatNinetyDaysDate } from "shared-utils";
import { CommonEmailVariables, Events } from "shared-types";
import { Text } from "@react-email/components";
import { PackageDetails, BasicFooter, FollowUpNotice } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { styles } from "../../email-styles";

export const ChipSpaStateEmail = ({
  variables,
}: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => (
  <BaseEmailTemplate
    previewText={`CHIP SPA ${variables.id} RAI Response Submitted`}
    heading="This response confirms you submitted a CHIP SPA RAI Response to CMS for review:"
    applicationEndpointUrl={variables.applicationEndpointUrl}
    footerContent={<BasicFooter />}
  >
    <PackageDetails
      details={{
        "State or Territory": variables.territory,
        Name: variables.submitterName,
        "Email Address": variables.submitterEmail,
        "CHIP SPA Package ID": variables.id,
        "90th Day Deadline": formatNinetyDaysDate(variables.timestamp),
        Summary: variables.additionalInformation,
      }}
    />
    <Text style={styles.text.description}>
      {`This response confirms receipt of your CHIP State Plan Amendment (SPA or your response to a
        SPA Request for Additional Information (RAI)). You can expect a formal response to your
        submittal to be issued within 90 days, before ${formatNinetyDaysDate(variables.timestamp)}.`}
    </Text>
    <FollowUpNotice isChip withDivider={false} />
  </BaseEmailTemplate>
);
