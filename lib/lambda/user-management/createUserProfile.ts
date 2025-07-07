import { produceMessage } from "libs/api/kafka";
import { APIGatewayEvent } from "shared-types";

import { authedMiddy, ContextWithCurrUser } from "../middleware";
import { getUserByEmail } from "./userManagementService";

export const handler = authedMiddy({ opensearch: true, kafka: true, setToContext: true }).handler(
  async (event: APIGatewayEvent, context: ContextWithCurrUser) => {
    const { currUser } = context;

    if (!currUser?.email) {
      throw new Error("Email is undefined");
    }

    const userInfo = await getUserByEmail(currUser.email);

    const id = `${currUser.email}_user-information`;

    if (!userInfo) {
      await produceMessage(
        process.env.topicName || "",
        id,
        JSON.stringify({
          eventType: "user-info",
          email: currUser.email,
          fullName: `${currUser.given_name} ${currUser.family_name}`,
        }),
      );

      return {
        statusCode: 200,
        body: { message: "User profile created" },
      };
    }

    return {
      statusCode: 200,
      body: { message: "User profile already exists" },
    };
  },
);
