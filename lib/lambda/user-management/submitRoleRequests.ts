import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { produceMessage } from "lib/libs/api/kafka";
import { response } from "libs/handler-lib";

import { getAllUserRolesByEmail, getLatestActiveRoleByEmail } from "./user-management-service";

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
  console.log(event, "EVENTTT");

  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  const { userId, poolId } = getAuthDetails(event);
  const userAttributes = await lookupUserAttributes(userId, poolId);
  console.log(userAttributes, "USER ATTRIBUTES");

  const userRoles = await getAllUserRolesByEmail(userAttributes.email);
  if (!userRoles.length) {
    return response({
      statusCode: 400,
      body: { message: "User doesn't have any roles" },
    });
  }

  const latestActiveRoleObj = await getLatestActiveRoleByEmail(userAttributes.email);
  console.log(latestActiveRoleObj, "ACTIVE ROLE");
  if (!latestActiveRoleObj) {
    return response({
      statusCode: 400,
      body: { message: "No active role found for user" },
    });
  }

  // Extract the email, state, and grantAccess fields from the event body
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
      status,
      territory: state,
      role: role, // ?? get user main role? can there only be 1 active role?
      doneByEmail: userAttributes.email,
      doneByName: `${userAttributes.given_name} ${userAttributes.family_name}`, // full name of current user
      date: Date.now(), // correct time format?
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `Request to access ${state} has been submitted.` },
  });
};

export const handler = submitRoleRequests;
