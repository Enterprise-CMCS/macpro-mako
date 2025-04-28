import { BasicFooter } from "../../email-components";
import { BaseEmailTemplate } from "../../email-templates";
import { statesMap } from "../types";
import { UserRoleEmailType } from "./AccessChangeNotice";

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
