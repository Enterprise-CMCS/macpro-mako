import { CommonEmailVariables, Events } from "shared-types";
import { FollowUpNotice, BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const MedSpaStateEmail = (props: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  return (
    <BaseEmailTemplate
      previewText={`Medicaid SPA Package ${variables.id} Withdrawal Confirmation`}
      heading={`This email is to confirm Medicaid SPA ${variables.id} was withdrawn by ${variables.submitterName}. The review of Medicaid SPA ${variables.id} has concluded.`}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <FollowUpNotice includeStateLead={false} />
    </BaseEmailTemplate>
  );
};
