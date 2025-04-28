import { AccessChangeNoticeEmail } from "../../content/userRoles/emailTemplates";
import { userRoleEmailMockVars } from "../../mock-data/email-roles";

export default () => {
  return <AccessChangeNoticeEmail variables={userRoleEmailMockVars} />;
};
