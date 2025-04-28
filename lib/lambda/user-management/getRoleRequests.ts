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
      // get all of the role requests
      roleRequests = await getAllUserRoles();
    } else if (cmsRoleApprover) {
      // get all of the role requests
      roleRequests = await getAllUserRoles();

      // filter out other cmsroleapprovers and systemadmins
      // cmsroleapprovers cannot approve those role requests
      roleRequests = roleRequests.filter(
        (roleObj) => !["cmsroleapprover", "systemadmin"].includes(roleObj?.role),
      );
    } else if (stateSystemAdmin?.territory) {
      roleRequests = await getAllUserRolesByState(stateSystemAdmin?.territory);

      // filter out other statesystemadmins
      // statesystemadmins cannot approve those role requests
      roleRequests = roleRequests.filter((roleObj) => roleObj?.role !== "statesystemadmin");
    }

    // remove the user from the role requests
    // the user cannot approve their own role requests
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
