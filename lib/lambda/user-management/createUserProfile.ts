import { createError } from "@middy/util";
import { produceMessage } from "libs/api/kafka";
import { APIGatewayEvent } from "shared-types";

import { authedMiddy, ContextWithCurrUser } from "../middleware";
import { getUserByEmail } from "./userManagementService";

export const handler = authedMiddy({ opensearch: true, kafka: true, setToContext: true }).handler(
  async (event: APIGatewayEvent, context: ContextWithCurrUser) => {
    const { currUser } = context;

    if (!currUser?.email) {
      console.error("Email is undefined");
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    let userInfo;
    try {
      userInfo = await getUserByEmail(currUser.email);
    } catch (err) {
      console.error(err);
      throw createError(500, JSON.stringify({ message: "Internal server error" }), {
        expose: true,
      });
    }

    const id = `${currUser.email}_user-information`;

    if (!userInfo) {
      try {
        await produceMessage(
          process.env.topicName || "",
          id,
          JSON.stringify({
            eventType: "user-info",
            email: currUser.email,
            fullName: `${currUser.given_name} ${currUser.family_name}`,
          }),
        );
      } catch (err) {
        console.error(err);
        throw createError(500, JSON.stringify({ message: "Internal server error" }), {
          expose: true,
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "User profile created" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `User profile already exists` }),
    };
  },
);
