import { produceMessage } from "libs/api/kafka";
import { APIGatewayEvent } from "shared-types";
import { normalizeEmail } from "shared-utils";

import { authenticatedMiddy, ContextWithAuthenticatedUser } from "../middleware";
import { getUserByEmail } from "./userManagementService";

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

  const id = `${normalizedEmail}_user-information`;

  if (!userInfo) {
    await produceMessage(
      process.env.topicName || "",
      id,
      JSON.stringify({
        eventType: "user-info",
        email: normalizedEmail,
        fullName: `${authenticatedUser.given_name} ${authenticatedUser.family_name}`,
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
});
