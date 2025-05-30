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
        try {
          const approvers = await getApproversByRoleState(roleObj.role, roleObj.territory);
          return { role: roleObj.role, territory: roleObj.territory, approvers: approvers };
        } catch (err) {
          console.error(
            `Error getting approvers for role ${roleObj.role} and territory ${roleObj.territory}`,
            err,
          );
          return { role: roleObj.role, territory: roleObj.territory, approvers: [] };
        }
      }),
    );

    return response({
      statusCode: 200,
      body: {
        message: "Approver list successfully retrieved.",
        approverList: approverList,
      },
    });
  } catch (err: unknown) {
    console.error("Unhandled error in getApprovers:", err);
    return response({
      statusCode: 500,
      body: {
        message: "Internal server error",
        error: err instanceof Error ? err.message : JSON.stringify(err),
      },
    });
  }
};

export const handler = getApprovers;
