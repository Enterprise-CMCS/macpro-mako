import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
import { StateAccess } from "react-app/src/api";
import { UserRole } from "shared-types/events/legacy-user";
import { getApprovingRole } from "shared-utils";

import { getUserProfileSchema } from "./getUserProfile";
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
    let lookupEmail = email;

    if (event.body) {
      const eventBody = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      const safeEventBody = getUserProfileSchema.safeParse(eventBody);

      // if the event has a body with a userEmail, the userEmail is not the same as
      // the current user's email, and the current user is a user manager, then
      // return the data for the userEmail instead of the current user
      if (
        safeEventBody.success &&
        safeEventBody?.data?.userEmail &&
        safeEventBody.data.userEmail !== email
      ) {
        lookupEmail = safeEventBody.data.userEmail;
      }
    }

    const userRoles = await getAllUserRolesByEmail(lookupEmail);

    // this is used for state submitters to filter out the territory AFTER the search
    const roleStateMap = new Map<string, Territory[]>();
    // this is used for all other role types because there are many overlapping approver roles
    // and we want to minimize number of search calls
    const savedApprovers = new Map<string, { email: string; fullName: string }[]>();

    if (userRoles) {
      userRoles.forEach(({ role, territory }: approverListType) => {
        if (!roleStateMap.has(role)) {
          roleStateMap.set(role, []);
        }
        roleStateMap.get(role)!.push(territory);
      });
    }

    const approverList = await Promise.all(
      // it will loop through each role a user has
      Array.from(roleStateMap.entries()).map(async ([role, territories]) => {
        const isStateSubmitter = role === "statesubmitter";
        const approvingRole = getApprovingRole(role);
        // if we already queried for this role than we don't need to do so again
        if (savedApprovers.has(approvingRole)) {
          return {
            role,
            territory: territories,
            approvers: savedApprovers.get(approvingRole),
          };
        }
        try {
          const allApprovers = await getApproversByRole(role); // pass in the role of current user NOT approving role

          // save for future check
          savedApprovers.set(approvingRole, allApprovers);
          // state submitters should filter approvers for territory
          const filtered = isStateSubmitter
            ? allApprovers.filter((approver) =>
                territories.includes(approver.territory as Territory),
              )
            : allApprovers;

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
