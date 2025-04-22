import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { produceMessage } from "lib/libs/api/kafka";
import { response } from "libs/handler-lib";

import {
  getAllUserRolesByEmail,
  getLatestActiveRoleByEmail,
  getUserByEmail,
} from "./userManagementService";

export const ROLES_ALLOWED_TO_GRANT = ["cmsroleapprover", "statesystemadmin"];
export const ROLES_ALLOWED_TO_REQUEST = ["statesubmitter"];

export const canGrantAccess = (role: string): boolean => {
  return ROLES_ALLOWED_TO_GRANT.includes(role);
};

export const canRequestAccess = (role: string): boolean => {
  return ROLES_ALLOWED_TO_REQUEST.includes(role);
};

type RoleStatus = "active" | "denied" | "pending";

export const submitRoleRequests = async (event: APIGatewayEvent) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  const { userId, poolId } = getAuthDetails(event);
  const userAttributes = await lookupUserAttributes(userId, poolId);
  console.log(userAttributes, "USER ATTRIBUTES");
  // dumb; this is to grab the full name of the user in the users index instead of Cognito
  const userInfo = await getUserByEmail(userAttributes.email);
  console.log(userInfo, "USER INFO NOT COGNITO");

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

  const { email, state, role, eventType, grantAccess } =
    typeof event.body === "string" ? JSON.parse(event.body) : event.body;

  let status: RoleStatus;
  // Check if the user's role is allowed to grant or request access
  if (!canGrantAccess(latestActiveRoleObj.role) && !canRequestAccess(latestActiveRoleObj.role)) {
    console.warn(`Unauthorized action attempt by ${email}`);
    return response({
      statusCode: 403,
      body: { message: "You are not authorized to perform this action." },
    });
  }

  // Determine the status based on the user's role and action
  if (canGrantAccess(latestActiveRoleObj.role)) {
    if (grantAccess === true || grantAccess === false) {
      // Grant access or deny access based on the `grantAccess` value
      status = grantAccess ? "active" : "denied";
    } else {
      return response({
        statusCode: 400,
        body: { message: "Invalid grantAccess value." },
      });
    }
  } else if (canRequestAccess(latestActiveRoleObj.role)) {
    // If the role is allowed to request access, set status to "pending"
    status = "pending";
  } else {
    // If the role can't grant or request access, return an error
    return response({
      statusCode: 403,
      body: { message: "You are not authorized to perform this action." },
    });
  }

  const id = `${email}_${state}_${latestActiveRoleObj.role}`;

  await produceMessage(
    topicName,
    id,
    JSON.stringify({
      eventType,
      email,
      status,
      territory: state,
      role, // role for this state
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
