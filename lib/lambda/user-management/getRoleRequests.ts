import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
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
  if (!event?.requestContext) {
    return response({
      statusCode: 400,
      body: { message: "Request context required" },
    });
  }

  let authDetails;
  try {
    authDetails = getAuthDetails(event);
  } catch (err) {
    console.error(err);
    return response({
      statusCode: 401,
      body: { message: "User not authenticated" },
    });
  }

  try {
    const { userId, poolId } = authDetails;
    const { email } = await lookupUserAttributes(userId, poolId);

    // get all of the roles for the current user
    const userRoles = await getAllUserRolesByEmail(email);
    const approverRoles = userRoles.filter(
      (roleObj: StateAccess) =>
        ["cmsroleapprover", "systemadmin", "helpdesk", "statesystemadmin"].includes(
          roleObj?.role,
        ) && roleObj?.status === "active",
    );

    if (!approverRoles.length) {
      return response({
        statusCode: 403,
        body: { message: "User not authorized to approve roles" },
      });
    }

    const cmsRoleApprover = getActiveRole(approverRoles, "cmsroleapprover");
    const systemAdmin = getActiveRole(approverRoles, "systemadmin");
    const helpDesk = getActiveRole(approverRoles, "helpdesk");
    const stateSystemAdmin = getActiveRole(approverRoles, "statesystemadmin");

    let roleRequests: StateAccess[] = [];

    if (systemAdmin || helpDesk) {
      roleRequests = await getAllUserRoles();
    }

    if (cmsRoleApprover) {
      roleRequests = await getAllUserRoles();
      // cmsroleapprovers can only see statesystemadmin requests
      roleRequests = roleRequests.filter((roleObj) => roleObj?.role === "statesystemadmin");
    }

    if (stateSystemAdmin) {
      roleRequests = await getAllUserRolesByState(stateSystemAdmin?.territory);

      // statesystemadmins cannot update other statesystemadmin requests
      roleRequests = roleRequests.filter((roleObj) => roleObj?.role !== "statesystemadmin");
    }

    // filter out the current user from the role requests
    roleRequests = roleRequests.filter((adminRole) => adminRole?.email !== email);

    const roleRequestsWithName = await getUserRolesWithNames(roleRequests);

    return response({
      statusCode: 200,
      body: roleRequestsWithName,
    });
  } catch (err: unknown) {
    console.log("An error occurred: ", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getRoleRequests;
