import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { response } from "lib/libs/handler-lib";
import { StateAccess } from "react-app/src/api";
import { APIGatewayEvent } from "shared-types";

import {
  getAllUserRoles,
  getAllUserRolesByEmail,
  getAllUserRolesByState,
  getUserRolesWithNames,
} from "./user-management-service";

export const getRoleRequests = async (event: APIGatewayEvent) => {
  try {
    const { userId, poolId } = getAuthDetails(event);
    const { email } = await lookupUserAttributes(userId, poolId);

    const userRoles = await getAllUserRolesByEmail(email);
    console.log(userRoles, "USER ROLES??");
    if (!userRoles.length) {
      return response({
        statusCode: 400,
        body: { message: "User doesn't have any roles" },
      });
    }

    let roleRequests: StateAccess[] = [];

    const cmsRoleApproverRole = userRoles.find(
      (roleObj: StateAccess) => roleObj.role === "cmsroleapprover" && roleObj.status === "active",
    );
    const stateSystemAdminRole = userRoles.find(
      (roleObj: StateAccess) => roleObj.role === "statesystemadmin" && roleObj.status === "active",
    );

    if (cmsRoleApproverRole) {
      roleRequests = await getAllUserRoles();
    } else if (stateSystemAdminRole?.territory) {
      console.log("are we in here");
      roleRequests = await getAllUserRolesByState(stateSystemAdminRole.territory);
    }
    console.log(roleRequests, "ROLE REQUESTS??");
    if (!roleRequests.length || !Array.isArray(roleRequests)) {
      return response({
        statusCode: 400,
        body: { message: "Error getting role requests" },
      });
    }

    const roleRequestsWithName = await getUserRolesWithNames(roleRequests);

    return response({
      statusCode: 200,
      body: roleRequestsWithName,
    });
  } catch (err: unknown) {
    console.log("An error occured: ", err);
  }
};

export const handler = getRoleRequests;
