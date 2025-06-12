import { Text } from "@react-email/components";
import { CommonEmailVariables, Events } from "shared-types";

import { BasicFooter, FollowUpNotice } from "../../email-components";
import { styles } from "../../email-styles";
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
      <Text style={{ ...styles.text.base, marginTop: "16px" }}>
        If you have questions or did not expect this email, please contact your CPOC. $
        <pre>{JSON.stringify(variables, null, 2)}</pre>
      </Text>
      <FollowUpNotice includeStateLead={false} includeDidNotExpect={true} />
    </BaseEmailTemplate>
  );
};
