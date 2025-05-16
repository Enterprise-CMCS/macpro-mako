import { SelfRevokeAdminChangeEmail } from "../../content/userRoles/emailTemplates";
import { userRoleEmailMockVars } from "../../mock-data/email-roles";
export default () => {
  return <SelfRevokeAdminChangeEmail variables={userRoleEmailMockVars} />;
};
