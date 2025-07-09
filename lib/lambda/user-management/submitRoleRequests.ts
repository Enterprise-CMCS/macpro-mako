import { createError } from "@middy/util";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { baseRoleInformationSchema } from "shared-types/events/legacy-user";
import { canRequestAccess, canSelfRevokeAccess, canUpdateAccess } from "shared-utils";
import { z } from "zod";

import { authenticatedMiddy, ContextWithAuthenticatedUser } from "../middleware";
import { getUserByEmail } from "./userManagementService";

type RoleStatus = "active" | "denied" | "pending" | "revoked";

export const submitRoleRequestEventSchema = z
  .object({
    body: baseRoleInformationSchema,
  })
  .passthrough();

export type SubmitRoleRequestEvent = APIGatewayEvent & z.infer<typeof submitRoleRequestEventSchema>;

export const handler = authenticatedMiddy({
  opensearch: true,
  kafka: true,
  setToContext: true,
  eventSchema: submitRoleRequestEventSchema,
}).handler(async (event: SubmitRoleRequestEvent, context: ContextWithAuthenticatedUser) => {
  const { authenticatedUser } = context;
  const {
    email,
    state,
    role: roleToUpdate,
    eventType,
    grantAccess = "pending",
    requestRoleChange,
    group = null,
    division = null,
  } = event.body;

  if (!authenticatedUser?.email) {
    throw new Error("Email is undefined");
  }

  const userInfo = await getUserByEmail(authenticatedUser.email);

  let status: RoleStatus;
  // Determine the status based on the user's role and action
  // Not a role request change; user is updating another role access request
  if (!requestRoleChange && canUpdateAccess(authenticatedUser.role, roleToUpdate)) {
    status = grantAccess;
  } else if (
    !requestRoleChange &&
    grantAccess === "revoked" &&
    userInfo?.email &&
    canSelfRevokeAccess(authenticatedUser.role, userInfo.email, email)
  ) {
    // Not a role request change; user is revoking their own access
    status = "revoked";
  } else if (requestRoleChange && canRequestAccess(authenticatedUser.role)) {
    // User is permitted to request a role change
    status = "pending";
  } else {
    console.warn(`Unauthorized action attempt by ${userInfo?.email}`);

    throw createError(
      403,
      JSON.stringify({ message: "You are not authorized to perform this action." }),
    );
  }

  const id = `${email}_${state}_${roleToUpdate}`;
  const date = Date.now(); // correct time format?
  const doneByEmail = userInfo?.email || authenticatedUser.email;
  const doneByName =
    userInfo?.fullName || `${authenticatedUser.given_name} ${authenticatedUser.family_name}`; // full name of current user. Cognito (userAttributes) may have a different full name

  await produceMessage(
    process?.env?.topicName || "",
    id,
    JSON.stringify({
      eventType,
      email,
      status,
      territory: state,
      role: roleToUpdate, // role for this state or newly requested role
      doneByEmail,
      doneByName,
      date,
      group,
      division,
    }),
  );

  if (
    canUpdateAccess(authenticatedUser.role, roleToUpdate) &&
    grantAccess === "active" &&
    group &&
    division
  ) {
    await produceMessage(
      process.env.topicName || "",
      userInfo?.id || id,
      JSON.stringify({
        eventType: "user-info",
        email: doneByEmail,
        group,
        division,
        fullName: doneByName,
      }),
    );
  }

  return {
    statusCode: 200,
    body: {
      message: `Request to access ${state} has been submitted.`,
      eventType,
      email,
      status,
      territory: state,
      role: roleToUpdate, // role for this state
      doneByEmail,
      doneByName,
      date,
    },
  };
});
