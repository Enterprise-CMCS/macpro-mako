import { CommonEmailVariables, Events } from "shared-types";
import { FollowUpNotice, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const ChipSpaStateEmail = (props: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <BaseEmailTemplate
      previewText={`CHIP SPA Package ${variables.id} Withdrawal Confirmation`}
      heading={`This email is to confirm CHIP SPA ${variables.id} was withdrawn by ${variables.submitterName}. The review of CHIP SPA ${variables.id} has concluded.`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <FollowUpNotice isChip />
    </BaseEmailTemplate>
  );
};
