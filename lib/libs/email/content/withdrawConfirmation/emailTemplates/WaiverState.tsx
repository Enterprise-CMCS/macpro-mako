import { CommonEmailVariables, Events } from "shared-types";

import { BasicFooter, FollowUpNotice } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";

export const WaiverStateEmail = (props: {
  variables: Events["WithdrawPackage"] & CommonEmailVariables;
}) => {
  const variables = props.variables;
  const previewText = `Withdrawal of ${variables.authority} ${variables.id}`;
  const heading = `This email is to confirm ${variables.actionType} ${variables.id} was withdrawn by ${variables.submitterName}. The review of ${variables.actionType} ${variables.id} has concluded.`;
  return (
    <BaseEmailTemplate
      previewText={previewText}
      heading={heading}
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <FollowUpNotice includeDidNotExpect={false} />
    </BaseEmailTemplate>
  );
};
