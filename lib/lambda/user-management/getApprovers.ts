import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
import { StateCode } from "shared-types";
import { UserRole } from "shared-types/events/legacy-user";

import { getApproversByRoleState } from "./userManagementService";

type getApproverType = {
  state: StateCode | "N/A";
  role: UserRole;
};

const getApprovers = async (event: APIGatewayEvent) => {
  if (!event?.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  if (!event?.requestContext) {
    return response({
      statusCode: 400,
      body: { message: "Request context required" },
    });
  }

  try {
    getAuthDetails(event);
  } catch (err) {
    console.error(err);
    return response({
      statusCode: 401,
      body: { message: "User not authenticated" },
    });
  }

  const { state, role } = JSON.parse(event.body) as getApproverType;

  if (!role) {
    return response({
      statusCode: 400,
      body: { message: "user role required" },
    });
  }
  try {
    const approverList = await getApproversByRoleState(role, state);
    return response({
      statusCode: 200,
      body: {
        message: "approver list",
        approverList: approverList,
      },
    });
  } catch (err: unknown) {
    console.log("An error occurred: ", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = getApprovers;
