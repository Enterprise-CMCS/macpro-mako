import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
import { UserRole } from "node_modules/shared-types/events/legacy-user";
import { StateAccess } from "react-app/src/api";

import { getAllUserRolesByEmail, getApproversByRole } from "./userManagementService";

type Territory = StateAccess | "N/A";
type approverListType = {
  role: UserRole;
  territory: Territory;
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
    const roleStateMap = new Map<string, Territory[]>();

    userRoles.forEach(({ role, territory }: approverListType) => {
      if (!roleStateMap.has(role)) {
        roleStateMap.set(role, []);
      }
      roleStateMap.get(role)!.push(territory);
    });

    const approverList = await Promise.all(
      Array.from(roleStateMap.entries()).map(async ([role, territories]) => {
        try {
          const allApprovers = await getApproversByRole(role);

          const filtered = allApprovers.filter((approver) =>
            territories.includes(approver.territory as Territory),
          );

          return {
            role,
            territory: territories,
            approvers: filtered,
          };
        } catch (err) {
          console.error(`Error getting approvers for role ${role}`, err);
          return { role, territory: territories, approvers: [] };
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
