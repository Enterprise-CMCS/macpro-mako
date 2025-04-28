import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";

import { getUserByEmail } from "./userManagementService";

export const createUserProfile = async (event: APIGatewayEvent) => {
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
        body: { message: "User profile created" },
      });
    }

    return response({
      statusCode: 200,
      body: { message: `User profile already exists` },
    });
  } catch (err: unknown) {
    console.log("An error occurred: ", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = createUserProfile;
