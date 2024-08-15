import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { isAuthorized } from "../libs/api/auth/user";

import { newSubmission } from "shared-types";
import { produceMessage } from "../libs/api/kafka";

export const submit = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: "Event body required",
    });
  }

  // TODO: We should really type this, is would be hard, but not impossible
  const body = JSON.parse(event.body);
  console.log(body);

  // Check that the caller has appropriate permissions
  // Should his move to the transform?
  if (!(await isAuthorized(event, body.state))) {
    return response({
      statusCode: 403,
      body: { message: "Unauthorized" },
    });
  }

  // TODO... run an action check, to make sure its allowed
  // const originalWaiver = await getPackage(body.originalWaiverNumber);
  // const authDetails = getAuthDetails(event);
  // const userAttr = await lookupUserAttributes(
  //   authDetails.userId,
  //   authDetails.poolId,
  // );

  try {
    // Safe parse the event; throws an error when malformed
    const eventBody = await newSubmission.transform(event);

    await produceMessage(
      process.env.topicName as string,
      body.id,
      JSON.stringify(eventBody),
    );

    return response({
      statusCode: 200,
      body: { message: "success" },
    });
  } catch (err) {
    console.error("Error has occured during submission:", err);
    return response({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  }
};

export const handler = submit;
