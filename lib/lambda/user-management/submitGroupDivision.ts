import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";

import { getUserByEmail } from "./userManagementService";

export const submitGroupDivision = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      return response({
        statusCode: 400,
        body: { message: "Event body required" },
      });
    }

    const topicName = process.env.topicName as string;
    if (!topicName) {
      throw new Error("Topic name is not defined");
    }

    const { userEmail, group, division } = JSON.parse(event.body);
    const userInfo = await getUserByEmail(userEmail);

    if (userInfo === null) {
      return response({
        statusCode: 404,
        body: { message: `User with email ${userEmail} not found.` },
      });
    }

    const { fullName, email, id } = userInfo;

    await produceMessage(
      topicName,
      userInfo.id,
      JSON.stringify({
        id,
        email,
        group,
        division,
        fullName,
        eventType: "user-info",
      }),
    );

    return response({
      statusCode: 200,
      body: { message: "Group and division submitted successfully." },
    });
  } catch (error) {
    console.error("Error submitting group and division:", { error });
    return response({
      statusCode: 500,
      body: { message: `Internal Server Error: ${error.message}` },
    });
  }
};

export const handler = submitGroupDivision;
