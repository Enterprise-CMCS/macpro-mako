import { APIGatewayEvent } from "aws-lambda";
import { getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";

import { getUserByEmail, userHasThisRole } from "./userManagementService";

type SubmitGroupDivisionBody = {
  group: string;
  division: string;
};

export const submitGroupDivision = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      return response({
        statusCode: 400,
        body: { message: "Event body required" },
      });
    }
    const { group, division } = JSON.parse(event.body) as SubmitGroupDivisionBody;

    const topicName = process.env.topicName as string;
    if (!topicName) {
      throw new Error("Topic name is not defined");
    }

    const { userId, poolId } = getAuthDetails(event);
    const userAttributes = await lookupUserAttributes(userId, poolId);

    const userInfo = await getUserByEmail(userAttributes.email);
    const isDefaultCMSUser = await userHasThisRole(userAttributes.email, "N/A", "defaultcmsuser");

    if (!isDefaultCMSUser) {
      return response({
        statusCode: 403,
        body: { message: "User is not a default CMS user" },
      });
    }

    await produceMessage(
      topicName,
      userInfo.id,
      JSON.stringify({
        eventType: "user-info",
        email: userInfo.email,
        group,
        division,
        fullName: userInfo.fullName,
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
