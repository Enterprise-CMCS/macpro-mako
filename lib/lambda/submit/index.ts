import { APIGatewayEvent } from "aws-lambda";
import { produceCentraMessage, produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";
import { CE_EVENT } from "shared-types";
import { BaseSchemas } from "shared-types/events";

import { submissionPayloads } from "./submissionPayloads";

const CENTRA_EVENTS = new Set<string>([CE_EVENT.RECORD_SUBMITTED, CE_EVENT.SUBSEQUENT_DOCUMENTS]);

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
    const payload = JSON.stringify(eventBody);

    if (CENTRA_EVENTS.has(body.event)) {
      const centraTopicName = process.env.centraTopicName;
      if (!centraTopicName) {
        throw new Error("centraTopicName is not configured");
      }
      await produceCentraMessage(centraTopicName, body.id, payload);
    } else {
      await produceMessage(process.env.topicName as string, body.id, payload);
    }

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
