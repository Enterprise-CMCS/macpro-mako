import { AdminPendingNoticeEmail } from "../../content/userRoles/emailTemplates";
import { userRoleEmailMockVars } from "../../mock-data/email-roles";
export default () => {
  return <AdminPendingNoticeEmail variables={userRoleEmailMockVars} />;
};
