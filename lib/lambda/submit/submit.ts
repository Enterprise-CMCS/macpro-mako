import { response } from "libs/handler-lib";
import { APIGatewayEvent } from "aws-lambda";

import { submissionPayloads } from "./submissionPayloads";
import { produceMessage } from "../../libs/api/kafka";
import { BaseSchemas } from "shared-types/events";

export const submit = async (event: APIGatewayEvent) => {
  console.log('IN SUBMIT?')
  if (!event.body) {
    console.log('NO EVENT BODY')
    return response({
      statusCode: 400,
      body: "Event body required",
    });
  }

  const body: BaseSchemas = JSON.parse(event.body);

  console.log(body, 'AFTER BODY');
  // If there's no event, we reject
  if (!body.event) {
    console.log('NO BODY EVENT')
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
    console.log('IN THIS TRY')
    const eventBody = await submissionPayloads[body.event](event);
    console.log(body.event, 'BODY EVENT')
    console.log(event, 'WHATS EVENT')
    console.log(eventBody, 'event body')
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
