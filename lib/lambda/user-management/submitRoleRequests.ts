import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { produceMessage } from "lib/libs/api/kafka";
import {
  ROLES_ALLOWED_TO_REQUEST,
  ROLES_ALLOWED_TO_UPDATE,
  roleUpdatePermissionsMap,
  UserRole,
} from "lib/packages/shared-types/events/legacy-user";
import { response } from "libs/handler-lib";

import {
  getAllUserRolesByEmail,
  getLatestActiveRoleByEmail,
  getUserByEmail,
} from "./userManagementService";

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
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  const { userId, poolId } = getAuthDetails(event);
  const userAttributes = await lookupUserAttributes(userId, poolId);

  // Grab the full name of the user in the users index instead of Cognito
  const userInfo = await getUserByEmail(userAttributes.email);

  const userRoles = await getAllUserRolesByEmail(userAttributes.email);
  if (!userRoles.length) {
    return response({
      statusCode: 400,
      body: { message: "User doesn't have any roles" },
    });
  }

  const latestActiveRoleObj = await getLatestActiveRoleByEmail(userAttributes.email);
  if (!latestActiveRoleObj) {
    return response({
      statusCode: 400,
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
  } = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

  // Check if the user's role is allowed to grant or request access
  if (
    !canUpdateAccess(latestActiveRoleObj.role, roleToUpdate) &&
    !canRequestAccess(latestActiveRoleObj.role)
  ) {
    console.warn(`Unauthorized action attempt by ${email}`);

    return response({
      statusCode: 403,
      body: { message: "You are not authorized to perform this action." },
    });
  }

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
    // If the role can't grant or request access, return an error
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
};

export const handler = submitRoleRequests;
