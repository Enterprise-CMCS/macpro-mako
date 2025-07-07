import { createError } from "@middy/util";
import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";

import { authedMiddy, ContextWithCurrUser } from "../middleware";
import { getAllUserRolesByEmail, getUserByEmail } from "./userManagementService";

export const handler = authedMiddy({ opensearch: true, kafka: true, setToContext: true }).handler(
  async (event: APIGatewayEvent, context: ContextWithCurrUser) => {
    const { currUser } = context;

    if (!currUser?.email) {
      console.error("Email is undefined");
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    const userInfo = await getUserByEmail(currUser.email);
    const userRoles = await getAllUserRolesByEmail(currUser.email);

    if (userRoles.length) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "User roles already created" }),
      };
    }

    const date = Date.now(); // correct time format?
    const doneByEmail = userInfo?.email || currUser.email;
    const doneByName = userInfo?.fullName || `${currUser.given_name} ${currUser.family_name}`; // full name of current user. Cognito (userAttributes) may have a different full name

    if (currUser["custom:ismemberof"]) {
      const id = `${currUser.email}_N/A_defaultcmsuser`;

      await produceMessage(
        process.env.topicName || "",
        id,
        JSON.stringify({
          eventType: "user-role",
          email: currUser.email,
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
        body: JSON.stringify({
          message: "User role updated, because no default role found",
        }),
      };
    }

    if (currUser["custom:cms-roles"].includes("onemac-helpdesk")) {
      const id = `${currUser.email}_N/A_helpdesk`;

      await produceMessage(
        process.env.topicName || "",
        id,
        JSON.stringify({
          eventType: "user-role",
          email: currUser.email,
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
        body: JSON.stringify({
          message: "User role updated, because no default role found",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User role not updated" }),
    };
  },
);
