import { createError } from "@middy/util";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { baseRoleInformationSchema } from "shared-types/events/legacy-user";
import { canRequestAccess, canSelfRevokeAccess, canUpdateAccess } from "shared-utils";
import { z } from "zod";

import { authedMiddy, ContextWithCurrUser } from "../middleware";
import { getUserByEmail } from "./userManagementService";

type RoleStatus = "active" | "denied" | "pending" | "revoked";

export const submitRoleRequestEventSchema = z
  .object({
    body: baseRoleInformationSchema,
  })
  .passthrough();

export type SubmitRoleRequestEvent = APIGatewayEvent & z.infer<typeof submitRoleRequestEventSchema>;

export const handler = authedMiddy({
  opensearch: true,
  kafka: true,
  setToContext: true,
  eventSchema: submitRoleRequestEventSchema,
}).handler(async (event: SubmitRoleRequestEvent, context: ContextWithCurrUser) => {
  const { currUser } = context;
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

  if (!currUser?.email) {
    throw new Error("Email is undefined");
  }

  const userInfo = await getUserByEmail(currUser.email);

  let status: RoleStatus;
  // Determine the status based on the user's role and action
  // Not a role request change; user is updating another role access request
  if (!requestRoleChange && canUpdateAccess(currUser.role, roleToUpdate)) {
    status = grantAccess;
  } else if (
    !requestRoleChange &&
    grantAccess === "revoked" &&
    userInfo?.email &&
    canSelfRevokeAccess(currUser.role, userInfo.email, email)
  ) {
    // Not a role request change; user is revoking their own access
    status = "revoked";
  } else if (requestRoleChange && canRequestAccess(currUser.role)) {
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
  const doneByEmail = userInfo?.email || currUser.email;
  const doneByName = userInfo?.fullName || `${currUser.given_name} ${currUser.family_name}`; // full name of current user. Cognito (userAttributes) may have a different full name

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
    canUpdateAccess(currUser.role, roleToUpdate) &&
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
