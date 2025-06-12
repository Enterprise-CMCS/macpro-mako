import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { response } from "libs/handler-lib";

import { getUserProfileSchema } from "./getUserProfile";
import { getAllUserRolesByEmail, getApproversByRole } from "./userManagementService";

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

    // loop through roles
    console.log("ANDIEEE!! before the loop");
    const approverList = await Promise.all(
      userRoles.map(async (userRole: { role: string; territories: string[] }) => {
        try {
          const allApprovers = await getApproversByRole(userRole.role); // pass in the role of current user NOT approving role
          return {
            role: userRole.role,
            territory: userRole.territories,
            approvers: allApprovers,
          };
        } catch (err) {
          console.log("ERROR: ", err);
          return response({
            statusCode: 500,
            body: {
              message: `Error getting approvers for role: ${userRole.role}`,
              error: err instanceof Error ? err.message : JSON.stringify(err),
            },
          });
        }
      }),
    );

    console.log("ANDIEEE!! after the loop");

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
