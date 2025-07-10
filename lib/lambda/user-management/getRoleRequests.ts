import { createError } from "@middy/util";
import { APIGatewayEvent } from "shared-types";
import { roles } from "shared-types/opensearch";
import { isUserManagerUser } from "shared-utils";

import { authenticatedMiddy, ContextWithAuthenticatedUser } from "../middleware";
import {
  getAllUserRoles,
  getAllUserRolesByEmail,
  getAllUserRolesByState,
  getUserRolesWithNames,
} from "./userManagementService";

const getActiveRole = (roles: roles.Document[], roleName: string) =>
  roles.find((roleObj) => roleObj.role === roleName && roleObj.status === "active");

export const handler = authenticatedMiddy({ opensearch: true, setToContext: true }).handler(
  async (event: APIGatewayEvent, context: ContextWithAuthenticatedUser) => {
    const { authenticatedUser } = context;

    if (!authenticatedUser?.email) {
      throw new Error("Email is undefined");
    }

    // get all of the roles for the current user
    const userRoles = await getAllUserRolesByEmail(authenticatedUser.email);

    const approverRoles = userRoles.filter(
      (roleObj) =>
        isUserManagerUser({ ...authenticatedUser, role: roleObj.role }) &&
        roleObj?.status === "active",
    );

    if (approverRoles.length <= 0) {
      throw createError(
        403,
        JSON.stringify({ message: "User is not authorized to approve roles" }),
      );
    }

    let roleRequests: roles.Document[] = [];
    if (getActiveRole(approverRoles, "systemadmin") || getActiveRole(approverRoles, "helpdesk")) {
      roleRequests = await getAllUserRoles();
    } else if (getActiveRole(approverRoles, "cmsroleapprover")) {
      roleRequests = await getAllUserRoles();

      // cmsroleapprovers can only see statesystemadmin requests
      roleRequests = roleRequests.filter((roleObj) => roleObj?.role === "statesystemadmin");
    } else {
      const stateSystemAdmin = getActiveRole(approverRoles, "statesystemadmin");

      if (stateSystemAdmin) {
        roleRequests = await getAllUserRolesByState(stateSystemAdmin?.territory);

        // statesystemadmins cannot update other statesystemadmin requests
        roleRequests = roleRequests.filter((roleObj) => roleObj?.role !== "statesystemadmin");
      }
    }

    // filter out the current user from the role requests
    roleRequests = roleRequests.filter((adminRole) => adminRole?.email !== authenticatedUser.email);

    if (!roleRequests.length) {
      return {
        statusCode: 200,
        body: [],
      };
    }

    const roleRequestsWithName = await getUserRolesWithNames(roleRequests);

    return {
      statusCode: 200,
      body: roleRequestsWithName,
    };
  },
);
