import { APIGatewayEvent } from "aws-lambda";
import {
  ROLES_ALLOWED_TO_REQUEST,
  ROLES_ALLOWED_TO_UPDATE,
  roleUpdatePermissionsMap,
  UserRole,
} from "lib/packages/shared-types/events/legacy-user";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";

import { getLatestActiveRoleByEmail, getUserByEmail } from "./userManagementService";

type RoleStatus = "active" | "denied" | "pending";

// Check if current user can update access for a certain role
export const canUpdateAccess = (currentUserRole: UserRole, roleToUpdate: UserRole): boolean => {
  if (ROLES_ALLOWED_TO_UPDATE.includes(currentUserRole)) {
    if (roleUpdatePermissionsMap[currentUserRole]?.includes(roleToUpdate)) {
      return true;
    }
  }
  return false;
};
// Check if current user can request to change their own role
export const canRequestAccess = (role: UserRole): boolean => {
  return ROLES_ALLOWED_TO_REQUEST.includes(role);
};

export const submitRoleRequests = async (event: APIGatewayEvent) => {
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

  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
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
    const userAttributes = await lookupUserAttributes(userId, poolId);
    const userInfo = await getUserByEmail(userAttributes?.email);
    const latestActiveRoleObj = await getLatestActiveRoleByEmail(userAttributes.email);

    if (!latestActiveRoleObj) {
      return response({
        statusCode: 403,
        body: { message: "No active role found for user" },
      });
    }

    const {
      email,
      state,
      role: roleToUpdate,
      eventType,
      grantAccess,
      requestRoleChange,
    } = JSON.parse(event.body);

    let status: RoleStatus;

    // Determine the status based on the user's role and action
    if (!requestRoleChange && canUpdateAccess(latestActiveRoleObj.role, roleToUpdate)) {
      if (grantAccess === true || grantAccess === false) {
        // Grant access or deny access based on the `grantAccess` value
        status = grantAccess ? "active" : "denied";
      } else {
        return response({
          statusCode: 400,
          body: { message: "Invalid or missing grantAccess value." },
        });
      }
    } else if (requestRoleChange && canRequestAccess(latestActiveRoleObj.role)) {
      // If the role is allowed to request access, set status to "pending"
      status = "pending";
    } else {
      console.warn(`Unauthorized action attempt by ${email}`);

      return response({
        statusCode: 403,
        body: { message: "You are not authorized to perform this action." },
      });
    }

    const id = `${email}_${state}_${roleToUpdate.role}`;

    await produceMessage(
      topicName,
      id,
      JSON.stringify({
        eventType,
        email,
        status,
        territory: state,
        role: roleToUpdate, // role for this state
        doneByEmail: userAttributes.email,
        doneByName: userInfo.fullName, // full name of current user. Cognito (userAttributes) may have a different full name
        date: Date.now(), // correct time format?
      }),
    );

    return response({
      statusCode: 200,
      body: { message: `Request to access ${state} has been submitted.` },
    });
  } catch (err: unknown) {
    console.log("An error occurred: ", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = submitRoleRequests;
