import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { response } from "lib/libs/handler-lib";
import { StateAccess } from "react-app/src/api";
import { APIGatewayEvent } from "shared-types";

import {
  getAllUserRoles,
  getAllUserRolesByEmail,
  getAllUserRolesByState,
  getUserByEmail,
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

    const roleRequestsWithName = await Promise.all(
      roleRequests.map(async (request) => {
        console.log(request, "REQUEST??");
        const email = request._id.split("_")[0];
        console.log(email, "EMAIL");
        const fullName = await getUserByEmail(email);
        console.log("WHAT IS FULL NAME", fullName);
        return { ...request };
      }),
    );
    console.log(roleRequestsWithName, "WITH NAME");
    return response({
      statusCode: 200,
      body: roleRequestsWithName,
    });
  } catch (err: unknown) {
    console.log("An error occured: ", err);
  }
};

export const handler = getRoleRequests;
