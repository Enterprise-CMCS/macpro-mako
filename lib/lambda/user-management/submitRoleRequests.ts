import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";
import { RoleRequest } from "react-app/src/api";
import { canRequestAccess, canSelfRevokeAccess, canUpdateAccess } from "shared-utils";

import { submitGroupDivision } from "./submitGroupDivision";
import { getLatestActiveRoleByEmail, getUserByEmail } from "./userManagementService";

type RoleStatus = "active" | "denied" | "pending" | "revoked";

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
      group = null,
      division = null,
    } = JSON.parse(event.body) as RoleRequest;

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
    } else if (
      !requestRoleChange &&
      !grantAccess &&
      canSelfRevokeAccess(latestActiveRoleObj.role, userInfo.email, email)
    ) {
      status = "revoked";
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

    const id = `${email}_${state}_${roleToUpdate}`;
    const date = Date.now(); // correct time format?

    await produceMessage(
      topicName,
      id,
      JSON.stringify({
        eventType,
        email,
        status,
        territory: state,
        role: roleToUpdate, // role for this state or newly requested role
        doneByEmail: userInfo.email,
        doneByName: userInfo.fullName, // full name of current user. Cognito (userAttributes) may have a different full name
        date,
        group,
        division,
      }),
    );

    // Update group and division info for new cmsroleapprovers
    if (
      canUpdateAccess(latestActiveRoleObj.role, roleToUpdate) &&
      grantAccess === true &&
      group &&
      division
    ) {
      await submitGroupDivision({ userEmail: email, group, division });
    }

    return response({
      statusCode: 200,
      body: {
        message: `Request to access ${state} has been submitted.`,
        eventType,
        email,
        status,
        territory: state,
        role: roleToUpdate, // role for this state
        doneByEmail: userAttributes.email,
        doneByName: userInfo.fullName, // full name of current user. Cognito (userAttributes) may have a different full name
        date,
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

export const handler = submitRoleRequests;
