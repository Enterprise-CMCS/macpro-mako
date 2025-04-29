import { UserRoleEmailType } from "../content/userRoles";
import { userRoleType } from "../content/userRoles/roleHelper";

export const userRoleEmailMockVars: UserRoleEmailType = {
  role: userRoleType.statesystemadmin,
  applicationEndpointUrl: "https://mako-dev.cms.gov/",
  status: "pending",
  territory: "OH",
  fullName: "Amazing Andie",
  email: "amazing_andie@example.com ",
};
