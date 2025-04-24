import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { produceMessage } from "lib/libs/api/kafka";
import { response } from "libs/handler-lib";

import { getAllUserRolesByEmail, getUserByEmail } from "./userManagementService";

export const requestBaseCMSAccess = async (event: APIGatewayEvent) => {
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
  if (userRoles.length) {
    return response({
      statusCode: 200,
      body: { message: "User role not updated" },
    });
  }

  if (userAttributes["custom:ismemberof"]) {
    const id = `${userAttributes.email}_NA_defaultcmsuser`;

    await produceMessage(
      topicName,
      id,
      JSON.stringify({
        eventType: "user-role",
        email: userAttributes.email,
        status: "active",
        territory: "N/A",
        role: "defaultcmsuser", // role for this state
        doneByEmail: userAttributes.email,
        doneByName: userInfo.fullName, // full name of current user. Cognito (userAttributes) may have a different full name
        date: Date.now(), // correct time format?
      }),
    );

    return response({
      statusCode: 200,
      body: {
        message: "User role updated, because no default role found",
      },
    });
  }

  return response({
    statusCode: 200,
    body: { message: `User role not updated` },
  });
};

export const handler = requestBaseCMSAccess;
