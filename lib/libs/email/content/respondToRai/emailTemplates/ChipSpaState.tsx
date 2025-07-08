import { Text } from "@react-email/components";
import { format } from "date-fns";
import { CommonEmailVariables, Events } from "shared-types";

import { BasicFooter, FollowUpNotice, PackageDetails } from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaStateEmail = ({
  variables,
}: {
  variables: Events["RespondToRai"] & CommonEmailVariables;
}) => {
  const chipPrefix = `CHIP${variables.isChipEligibility ? " Eligibility" : ""}`;

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
          "90th Day Deadline": format(new Date(variables.timestamp), `MMM d, yyyy '@ 11:59pm EST'`),
          Summary: variables.additionalInformation,
        }}
      />
      <Text style={styles.text.description}>
        {`This response confirms receipt of your CHIP State Plan Amendment (SPA or your response to a
        SPA Request for Additional Information (RAI)). You can expect a formal response to your
        submittal to be issued within 90 days, before ${format(new Date(variables.timestamp), `MMM d, yyyy '@ 11:59pm EST'`)}.`}
      </Text>
      <FollowUpNotice isChip withDivider={false} />
    </BaseEmailTemplate>
  );
};
