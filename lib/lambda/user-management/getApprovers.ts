import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";
import { StateCode } from "shared-types";

import { getUserProfileSchema } from "./getUserProfile";
import { getAllUserRolesByEmail, getApproversByRole } from "./userManagementService";

type Territory = StateCode | "N/A";
type approverListType = { id: string; role: string; email: string; territory: Territory };

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

      if (
        safeEventBody.success &&
        safeEventBody?.data?.userEmail &&
        safeEventBody.data.userEmail !== email
      ) {
        lookupEmail = safeEventBody.data.userEmail;
      }
    }

    const userRoles = await getAllUserRolesByEmail(lookupEmail);
    if (!userRoles) throw Error;

    const roleStateMap = new Map<string, Territory[]>();

    // we make a map for state submitters but also use the roles for all other users
    if (userRoles) {
      userRoles.forEach(({ role, territory }: approverListType) => {
        if (!roleStateMap.has(role)) {
          roleStateMap.set(role, []);
        }
        roleStateMap.get(role)!.push(territory);
      });
    }

    // loop through roles
    const approverList = [];

    for (const [role, territories] of roleStateMap.entries()) {
      try {
        const allApprovers = await getApproversByRole(role); // pass in the role of current user NOT approving role
        const filtered =
          role === "statesubmitter"
            ? allApprovers.filter((approver) =>
                territories.includes(approver.territory as Territory),
              )
            : allApprovers;
        approverList.push({
          role: role,
          territory: territories,
          approvers: filtered,
        });
      } catch (err) {
        console.log("ERROR: ", err);
        approverList.push({
          role: role,
          territory: territories,
          approvers: [
            { id: "error", fullName: "Error Fetching Approvers", email: "", territory: "N/A" },
          ],
        });
      }
    }

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
