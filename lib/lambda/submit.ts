import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";

import { events, FeSchemas } from "shared-types";
import { produceMessage } from "../libs/api/kafka";

export const submit = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: "Event body required",
    });
  }

  const body: FeSchemas = JSON.parse(event.body);

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
