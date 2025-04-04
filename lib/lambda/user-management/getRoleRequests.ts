import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { response } from "lib/libs/handler-lib";
import { APIGatewayEvent } from "shared-types";

import { getAllUserRolesByState } from "./user-management-service";

export const getRoleRequests = async (event: APIGatewayEvent) => {
  try {
    // check authentication
    // check role - state admin can only see role requests for that state
    // cms approver role can see all role requests
    const authDetails = getAuthDetails(event);
    const userAttributes = await lookupUserAttributes(authDetails.userId, authDetails.poolId);
    console.log(userAttributes, "USER ATTRIBUTES?");
    const role = userAttributes["custom:cms-roles"];

    let roleRequests: unknown[] = [];

    if (role === "onemac-state-user") {
      const state = userAttributes["custom:state"];
      console.log("WHAT IS THE STATE", state);
      if (!state) {
        // TODO: Fix message
        return response({
          statusCode: 400,
          body: { message: "User must be an admin of a state" },
        });
      }
      roleRequests = await getAllUserRolesByState(state);
    }

    console.log(role, "WHAT IS THE ROLE");

    return response({
      statusCode: 200,
      body: roleRequests,
    });
  } catch (err: unknown) {
    console.log("An error occured: ", err);
  }
};

export const handler = getRoleRequests;
