import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user.ts";
import { response } from "lib/libs/handler-lib.ts";
import { StateAccess } from "react-app/src/api";
import { APIGatewayEvent } from "shared-types";

import {
  getAllUserRoles,
  getAllUserRolesByEmail,
  getAllUserRolesByState,
  getUserRolesWithNames,
} from "./userManagementService";

const getActiveRole = (roles: StateAccess[], roleName: string) =>
  roles.find((roleObj) => roleObj.role === roleName && roleObj.status === "active");

export const getRoleRequests = async (event: APIGatewayEvent) => {
  try {
    const { userId, poolId } = getAuthDetails(event);
    const { email } = await lookupUserAttributes(userId, poolId);
    const userRoles = await getAllUserRolesByEmail(email);

    if (!userRoles.length) {
      return response({
        statusCode: 400,
        body: { message: "User doesn't have any roles" },
      });
    }

    const cmsRoleApprover = getActiveRole(userRoles, "cmsroleapprover");
    const systemAdmin = getActiveRole(userRoles, "systemadmin");
    const helpDesk = getActiveRole(userRoles, "helpdesk");
    const stateSystemAdmin = getActiveRole(userRoles, "statesystemadmin");

    let roleRequests: StateAccess[] = [];

    if (systemAdmin || cmsRoleApprover || helpDesk) {
      roleRequests = await getAllUserRoles();

      if (cmsRoleApprover) {
        // filter out other cmsroleapprovers and systemadmins
        const excludedRoles = new Set(["cmsroleapprover", "systemadmin"]);
        roleRequests = roleRequests.filter((role) => !excludedRoles.has(role.role));
      }
    } else if (stateSystemAdmin?.territory) {
      roleRequests = await getAllUserRolesByState(stateSystemAdmin.territory);
      // filter out other statesystemadmins
      roleRequests = roleRequests.filter((role) => role.role !== "statesystemadmin");
    }

    if (!Array.isArray(roleRequests) || !roleRequests.length) {
      return response({
        statusCode: 400,
        body: { message: "Error getting role requests" },
      });
    }

    // Exclude current user
    const filteredRequests = roleRequests.filter((adminRole) => adminRole.email !== email);

    const roleRequestsWithName = await getUserRolesWithNames(filteredRequests);

    return response({
      statusCode: 200,
      body: roleRequestsWithName,
    });
  } catch (err: unknown) {
    console.log("An error occured: ", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getRoleRequests;
