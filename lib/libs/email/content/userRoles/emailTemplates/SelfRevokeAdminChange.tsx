import { BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { UserRoleEmailType } from "../index";
import { statesMap } from "../roleHelper";

export const SelfRevokeAdminChangeEmail = ({ variables }: { variables: UserRoleEmailType }) => {
  const stateAccess = variables.territory === "N/A" ? "" : ` for ${statesMap[variables.territory]}`;
  return (
    <BaseEmailTemplate
      previewText={`The OneMAC State access for ${stateAccess} has been self-revoked by ${variables.fullName}.`}
      heading=""
      applicationEndpointUrl={variables.applicationEndpointUrl}
      footerContent={<BasicFooter />}
    >
      <p>Hello,</p>
      <p>
        The OneMAC State access for {stateAccess} has been self-revoked by {variables.fullName}.
        Please log into your User Management Dashboard to see the updated access.
      </p>
    </BaseEmailTemplate>
  );
};
