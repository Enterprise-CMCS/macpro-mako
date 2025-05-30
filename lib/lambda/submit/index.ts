import { APIGatewayEvent } from "aws-lambda";
import { produceMessage } from "libs/api/kafka";
import { response } from "libs/handler-lib";
import * as os from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { getOsNamespace } from "libs/utils";
import { BaseSchemas } from "shared-types/events";

import { submissionPayloads } from "./submissionPayloads";

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
    const { domain } = getDomainAndNamespace("main");

    const eventBody = await submissionPayloads[body.event](event);
    console.log(eventBody);
    if (eventBody?.isDraft) {
      console.log("draft");
      os.updateData(domain, {
        index: getOsNamespace("main"),
        id: eventBody.id,
        body: eventBody,
      });
    } else {
      await produceMessage(process.env.topicName as string, body.id, JSON.stringify(eventBody));
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
