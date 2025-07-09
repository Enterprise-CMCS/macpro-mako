import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";

import { authenticatedMiddy, ContextWithAuthenticatedUser } from "../middleware";
import { getAllUserRolesByEmail, getUserByEmail } from "./userManagementService";

export const handler = authenticatedMiddy({
  opensearch: true,
  kafka: true,
  setToContext: true,
}).handler(async (event: APIGatewayEvent, context: ContextWithAuthenticatedUser) => {
  const { authenticatedUser } = context;

  if (!authenticatedUser?.email) {
    throw new Error("Email is undefined");
  }

  const userInfo = await getUserByEmail(authenticatedUser.email);
  const userRoles = await getAllUserRolesByEmail(authenticatedUser.email);

  if (userRoles.length) {
    return {
      statusCode: 200,
      body: { message: "User roles already created" },
    };
  }

  const date = Date.now();
  const doneByEmail = userInfo?.email || authenticatedUser.email;
  const doneByName =
    userInfo?.fullName || `${authenticatedUser.given_name} ${authenticatedUser.family_name}`; // full name of current user. Cognito (userAttributes) may have a different full name

  if (authenticatedUser["custom:ismemberof"]) {
    const id = `${authenticatedUser.email}_N/A_defaultcmsuser`;

    await produceMessage(
      process.env.topicName || "",
      id,
      JSON.stringify({
        eventType: "user-role",
        email: authenticatedUser.email,
        status: "active",
        territory: "N/A",
        role: "defaultcmsuser", // role for this state
        doneByEmail,
        doneByName,
        date,
      }),
    );

    return {
      statusCode: 200,
      body: { message: "User role updated, because no default role found" },
    };
  }

  if (authenticatedUser["custom:cms-roles"].includes("onemac-helpdesk")) {
    const id = `${authenticatedUser.email}_N/A_helpdesk`;

    await produceMessage(
      process.env.topicName || "",
      id,
      JSON.stringify({
        eventType: "user-role",
        email: authenticatedUser.email,
        status: "active",
        territory: "N/A",
        role: "helpdesk", // role for this state
        doneByEmail,
        doneByName,
        date,
      }),
    );

    return {
      statusCode: 200,
      body: { message: "User role updated, because no default role found" },
    };
  }

  return {
    statusCode: 200,
    body: { message: "User role not updated" },
  };
});
