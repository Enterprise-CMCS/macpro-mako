import { Text } from "@react-email/components";
import { CommonEmailVariables, Events } from "shared-types";

import { BasicFooter, FollowUpNotice } from "../../email-components";
import { styles } from "../../email-styles";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaStateEmail = (props: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const chipPrefix = `CHIP${variables.isChipEligibility ? " Eligibility" : ""}`;

  return (
    <BaseEmailTemplate
      previewText={`${chipPrefix} SPA Package ${variables.id} Withdrawal Confirmation`}
      heading={`This email is to confirm ${chipPrefix} SPA ${variables.id} was withdrawn by ${variables.submitterName}. The review of ${chipPrefix} SPA ${variables.id} has concluded.`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        If you have questions or did not expect this email, please contact your CPOC. $
        <pre>{JSON.stringify(variables, null, 2)}</pre>
      </Text>
      <FollowUpNotice isChip includeDidNotExpect={false} />
    </BaseEmailTemplate>
  );
};
