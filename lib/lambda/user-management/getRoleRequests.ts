import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { response } from "lib/libs/handler-lib";
import { StateAccess } from "react-app/src/api";
import { APIGatewayEvent } from "shared-types";

import { getAllUserRolesByEmail, getAllUserRolesByState } from "./user-management-service";

export const getRoleRequests = async (event: APIGatewayEvent) => {
  try {
    // check authentication
    // check role - state admin can only see role requests for that state
    // cms approver role can see all role requests
    const { userId, poolId } = getAuthDetails(event);
    const userAttributes = await lookupUserAttributes(userId, poolId);
    const { email } = userAttributes;

    const userRoles = await getAllUserRolesByEmail(email);
    console.log(userRoles, "USER ROLES");
    if (!userRoles.length) {
      return response({
        statusCode: 200,
        body: { message: "User doesn't have any roles" },
      });
    }

    const stateAdminRole = userRoles.find(
      (role: StateAccess) => role.role === "statesystemadmin" && role.status === "active",
    );
    if (!stateAdminRole) {
      return response({
        statusCode: 200,
        body: { message: "User doesn't have appropriate roles" },
      });
    }
    const roleRequests = await getAllUserRolesByState(stateAdminRole.territory);
    console.log(roleRequests, "WHAT ARE THE ROLE REQUESTS");
    return response({
      statusCode: 200,
      body: roleRequests,
    });
  } catch (err: unknown) {
    console.log("An error occured: ", err);
  }
};

export const handler = getRoleRequests;
