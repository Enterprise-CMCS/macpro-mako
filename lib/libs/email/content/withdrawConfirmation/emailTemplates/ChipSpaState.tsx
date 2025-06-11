import { CommonEmailVariables, Events } from "shared-types";

import { BasicFooter, FollowUpNotice } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaStateEmail = (props: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const chipPrefix = `CHIP${variables.chipEligibility ? " Eligibility" : ""}`;

  return (
    <BaseEmailTemplate
      previewText={`${chipPrefix} SPA Package ${variables.id} Withdrawal Confirmation`}
      heading={`This email is to confirm ${chipPrefix} SPA ${variables.id} was withdrawn by ${variables.submitterName}. The review of ${chipPrefix} SPA ${variables.id} has concluded.`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <FollowUpNotice isChip includeDidNotExpect={false} />
    </BaseEmailTemplate>
  );
};
