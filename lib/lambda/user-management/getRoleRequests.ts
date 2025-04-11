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
    if (!userRoles.length) {
      return response({
        statusCode: 400,
        body: { message: "User doesn't have any roles" },
      });
    }

    let roleRequests = [];

    const cmsRoleApproverRole = userRoles.find(
      (roleObj: StateAccess) => roleObj.role === "cmsroleapprover",
    );
    const stateSystemAdminRole = userRoles.find(
      (roleObj: StateAccess) => roleObj.role === "statesystemadmin",
    );

    if (cmsRoleApproverRole) {
      roleRequests = await getAllUserRoles();
    } else if (stateSystemAdminRole?.territory) {
      roleRequests = await getAllUserRolesByState(stateSystemAdminRole.territory);
    }

    if (!roleRequests || !Array.isArray(roleRequests)) {
      return response({
        statusCode: 400,
        body: { message: "Error getting role requests " },
      });
    }
    console.log(roleRequests, "ROLE REQUESTSS");
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
