import { response } from "lib/libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";

import { submissionPayloads } from "./submissionPayloads";
import { produceMessage } from "lib/libs/api/kafka";
import { BaseSchemas } from "shared-types/events";

export const submit = async (event: APIGatewayEvent) => {
  if (!event.body) {
    return response({
      statusCode: 400,
      body: "Event body required",
    });
  }

  const body: BaseSchemas = JSON.parse(event.body);

  // If there's no event, we reject
  if (!body.event) {
    return response({
      statusCode: 400,
      body: { message: "Bad Request - Missing event name in body" },
    });
  }

  // If the event is unknown, we reject
  if (!(body.event in submissionPayloads)) {
    return response({
      statusCode: 400,
      body: { message: `Bad Request - Unknown event type ${body.event}` },
    });
  }

  try {
    const eventBody = await submissionPayloads[body.event](event);
    await produceMessage(process.env.topicName as string, body.id, JSON.stringify(eventBody));

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
