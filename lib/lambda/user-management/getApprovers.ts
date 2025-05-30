import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
import { UserRole } from "node_modules/shared-types/events/legacy-user";
import { StateAccess } from "react-app/src/api";

import { getAllUserRolesByEmail, getApproversByRoleState } from "./userManagementService";

type approverListType = {
  role: UserRole;
  territory: StateAccess | "N/A";
  approvers: { email: string; fullName: string }[];
};

const getApprovers = async (event: APIGatewayEvent) => {
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

    const userRoles = await getAllUserRolesByEmail(email);

    const approverList: approverListType[] = await Promise.all(
      userRoles.map(async (roleObj: StateAccess) => {
        const approvers = await getApproversByRoleState(roleObj.role, roleObj.territory);
        return { role: roleObj.role, territory: roleObj.territory, approvers: approvers };
      }),
    );

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
