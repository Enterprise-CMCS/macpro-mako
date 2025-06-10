import { Text } from "@react-email/components";
import { CommonEmailVariables, Events } from "shared-types";
import { formatNinetyDaysDate } from "shared-utils";

import { BasicFooter, FollowUpNotice, PackageDetails } from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaStateEmail = ({
  variables,
}: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const chipPrefix = `CHIP${variables.chipEligibility ? " Eligibility" : ""}`;

  return (
    <BaseEmailTemplate
      previewText={`${chipPrefix} ${variables.id} RAI Response Submitted`}
      heading={`This response confirms you submitted a ${chipPrefix} SPA RAI Response to CMS for review:`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <PackageDetails
        details={{
          "State or Territory": variables.territory,
          Name: variables.submitterName,
          "Email Address": variables.submitterEmail,
          [`${chipPrefix} SPA Package ID`]: variables.id,
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
};
