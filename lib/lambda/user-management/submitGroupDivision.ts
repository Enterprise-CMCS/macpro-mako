import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";

import { getUserByEmail } from "./userManagementService";

type SubmitGroupDivisionBody = {
  userEmail: string;
  group: string;
  division: string;
};

export const submitGroupDivision = async (body: SubmitGroupDivisionBody) => {
  try {
    const topicName = process.env.topicName as string;
    if (!topicName) {
      throw new Error("Topic name is not defined");
    }

    const { userEmail, group, division } = body;
    const userInfo = await getUserByEmail(userEmail);

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
