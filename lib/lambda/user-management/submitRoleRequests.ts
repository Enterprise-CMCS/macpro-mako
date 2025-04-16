import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { produceMessage } from "lib/libs/api/kafka";
import { response } from "libs/handler-lib";
import { StateAccess } from "react-app/src/api";

import { getAllUserRolesByEmail } from "./user-management-service";

export const submitRoleRequests = async (event: APIGatewayEvent) => {
  console.log(event, "EVENTTT");
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  const { userId, poolId } = getAuthDetails(event);
  console.log(await lookupUserAttributes(userId, poolId), "USER ATTRIBUTES");
  const userAttributes = await lookupUserAttributes(userId, poolId);

  const userRoles = await getAllUserRolesByEmail(userAttributes.email);
  if (!userRoles.length) {
    return response({
      statusCode: 400,
      body: { message: "User doesn't have any roles" },
    });
  }
  // could there be multiple active roles objs?
  const activeRole = userRoles.find((roleObj: StateAccess) => roleObj.status === "active");
  console.log(activeRole, "ACTIVE ROLE");
  const { state } = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
  const id = `${userAttributes.email}_${state}_${activeRole.role}`;
  // TODO: add user role to the end of ID
  await produceMessage(
    topicName,
    id,
    JSON.stringify({
      event: "user-role",
      email: userAttributes.email,
      status: "pending",
      territory: state,
      role: activeRole.role, // ?? get user main role? can there only be 1 active role?
      doneByEmail: userAttributes.email,
      doneByName: `${userAttributes.given_name} ${userAttributes.family_name}`, // get full name of current user
      date: Date.now(), // correct time format?
    }),
  );

  return response({
    statusCode: 200,
    body: { message: `Request to access ${state} has been submitted.` },
  });
};

export const handler = submitRoleRequests;
