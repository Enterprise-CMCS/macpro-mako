import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { normalizeEmail } from "shared-utils";

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

  const normalizedEmail = normalizeEmail(authenticatedUser.email);
  const userInfo = await getUserByEmail(normalizedEmail);
  const userRoles = await getAllUserRolesByEmail(normalizedEmail);

  if (userRoles.length) {
    return {
      statusCode: 200,
      body: { message: "User roles already created" },
    };
  }

  const date = Date.now();
  const doneByEmail = userInfo?.email || normalizedEmail;
  const doneByName =
    userInfo?.fullName || `${authenticatedUser.given_name} ${authenticatedUser.family_name}`; // full name of current user. Cognito (userAttributes) may have a different full name

  if (authenticatedUser["custom:ismemberof"]) {
    const id = `${normalizedEmail}_N/A_defaultcmsuser`;

    await produceMessage(
      process.env.topicName || "",
      id,
      JSON.stringify({
        eventType: "user-role",
        email: normalizedEmail,
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
    const id = `${normalizedEmail}_N/A_helpdesk`;

    await produceMessage(
      process.env.topicName || "",
      id,
      JSON.stringify({
        eventType: "user-role",
        email: normalizedEmail,
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
