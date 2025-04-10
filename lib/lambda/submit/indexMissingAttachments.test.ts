import { getRequestContext } from "mocks";
import { eventsAttachmentRequired } from "mocks/data/submit/base";
import { APIGatewayEvent } from "node_modules/shared-types";
import { describe, expect, it } from "vitest";

import { submit } from "./index";

describe("submit Lambda function missing objects in event", () => {
  it.each(
    eventsAttachmentRequired.map((event) => [
      event.event,
      JSON.stringify({ ...event, attachments: {} }),
    ]),
  )("should return a 500 if %s event is missing attachments", async (_, base) => {
    const event = {
      body: base,
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(500);
  });
});
