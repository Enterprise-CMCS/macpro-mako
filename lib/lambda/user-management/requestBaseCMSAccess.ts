import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";

import { getAllUserRolesByEmail } from "./userManagementService";

export const requestBaseCMSAccess = async (event: APIGatewayEvent) => {
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
    // const userInfo = await getUserByEmail(userAttributes.email);
    const userRoles = await getAllUserRolesByEmail(userAttributes.email);

    if (userRoles.length) {
      return response({
        statusCode: 200,
        body: { message: "User roles already created" },
      });
    }

    if (userAttributes["custom:ismemberof"]) {
      const id = `${userAttributes.email}_N/A_defaultcmsuser`;

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
          doneByName: `${userAttributes.given_name} ${userAttributes.family_name}`, // full name of current user. Cognito (userAttributes) may have a different full name
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
    if (userAttributes["custom:cms-roles"].includes("onemac-helpdesk")) {
      const id = `${userAttributes.email}_N/A_helpdesk`;

      await produceMessage(
        topicName,
        id,
        JSON.stringify({
          eventType: "user-role",
          email: userAttributes.email,
          status: "active",
          territory: "N/A",
          role: "helpdesk", // role for this state
          doneByEmail: userAttributes.email,
          doneByName: `${userAttributes.given_name} ${userAttributes.family_name}`, // full name of current user. Cognito (userAttributes) may have a different full name
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
      body: { message: "User role not updated" },
    });
  } catch (err: unknown) {
    console.log("An error occurred: ", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = requestBaseCMSAccess;
