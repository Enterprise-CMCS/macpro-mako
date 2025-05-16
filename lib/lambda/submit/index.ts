import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";
import { BaseSchemas } from "shared-types/events";

import { submissionPayloads } from "./submissionPayloads";

export const submit = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      return response({
        statusCode: 400,
        body: "Event body required",
      });
    }

    const body: BaseSchemas = JSON.parse(event.body);

    // Missing event field
    if (!body.event) {
      return response({
        statusCode: 400,
        body: { message: "Bad Request - Missing event name in body" },
      });
    }

    // Unknown event type
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
      console.error("Error has occurred during submission:", err);
      return response({
        statusCode: 500,
        body: { message: "Internal server error" },
      });
    }
  } catch (e) {
    console.error("Submit Lambda error:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

// ✅ Properly outside the function
export const handler = submit;
