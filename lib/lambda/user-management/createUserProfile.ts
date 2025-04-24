import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "lib/libs/api/auth/user";
import { produceMessage } from "lib/libs/api/kafka";
import { response } from "libs/handler-lib";

import { getUserByEmail } from "./userManagementService";

export const createUserProfile = async (event: APIGatewayEvent) => {
  const topicName = process.env.topicName as string;
  if (!topicName) {
    throw new Error("Topic name is not defined");
  }

  const { userId, poolId } = getAuthDetails(event);
  const userAttributes = await lookupUserAttributes(userId, poolId);
  const userInfo = await getUserByEmail(userAttributes.email);

  const id = `${userAttributes.email}_user-information`;

  if (!userInfo) {
    await produceMessage(
      topicName,
      id,
      JSON.stringify({
        eventType: "user-info",
        email: userAttributes.email,
        fullName: `${userAttributes.given_name} ${userAttributes.family_name}`,
      }),
    );

    return response({
      statusCode: 200,
      body: { message: "User information updated" },
    });
  }

  return response({
    statusCode: 200,
    body: { message: `User information not updated` },
  });
};

export const handler = createUserProfile;
