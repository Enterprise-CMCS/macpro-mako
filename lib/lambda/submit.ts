import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { isAuthorized } from "../libs/api/auth/user";

import { newSubmissionSchema } from "shared-types";
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

  const now = Date.now();

  try {
    // Safe parse the event; throws an error when malformed
    const eventBody = newSubmissionSchema.safeParse({
      ...body,
      timestamp: now,
    });

    if (!eventBody.success) {
      return console.log(
        "MAKO Validation Error. The following record failed to parse: ",
        JSON.stringify(eventBody),
        "Because of the following Reason(s): ",
        eventBody.error.message,
      );
    }

    await produceMessage(
      process.env.topicName as string,
      body.id,
      JSON.stringify(eventBody.data),
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
