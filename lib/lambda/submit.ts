import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";
import { isAuthorized } from "../libs/api/auth/user";

import { events } from "shared-types";
import { produceMessage } from "../libs/api/kafka";

export const submit = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: "Event body required",
    });
  }

  const body = JSON.parse(event.body);

  console.log(body);

  // If there's no event, we reject
  if (!body.event) {
    return response({
      statusCode: 400,
      body: { message: "Bad Request - Missing event name in body" },
    });
  }

  // If the event is unknown, we reject
  if (!(body.event in events)) {
    return response({
      statusCode: 400,
      body: { message: `Bad Request - Unknown event type ${body.event}` },
    });
  }

  // If the user is not authorized, we reject
  if (!(await isAuthorized(event, body.id.slice(0, 2)))) {
    // TODO:  move this to the transform
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
    const eventBody = await events[body.event].transform(event);

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
