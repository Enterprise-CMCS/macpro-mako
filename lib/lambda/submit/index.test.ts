import { getRequestContext, NOT_FOUND_ITEM_ID } from "mocks";
import { events, uploadSubsequentDocuments } from "mocks/data/submit/base";
import { APIGatewayEvent } from "shared-types";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { submit } from "./index";

vi.mock("libs/api/kafka", () => ({
  produceMessage: vi.fn(() => Promise.resolve([{ partition: 0, offset: "1" }])),
}));

describe("submit Lambda function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.topicName = "test-topic";
  });

  it("should handle a submission with no body", async () => {
    const event = {} as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual('"Event body required"');
  });

  it("should handle a submission with no event in the body", async () => {
    const event = {
      body: `{"event": ""}`,
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual('{"message":"Bad Request - Missing event name in body"}');
  });

  it("should handle a submission with a bad event in the body", async () => {
    const event = {
      body: `{"event": "Not a real event"}`,
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual('{"message":"Bad Request - Unknown event type Not a real event"}');
  });

  it("should handle an upload-subsequent-document with an invalid item ID", async () => {
    const event = {
      body: JSON.stringify({
        ...uploadSubsequentDocuments,
        id: NOT_FOUND_ITEM_ID,
        waiverNumber: NOT_FOUND_ITEM_ID,
      }),
      requestContext: getRequestContext(),
    } as unknown as APIGatewayEvent;
    const result = await submit(event);

    expect(result.statusCode).toEqual(500);
    expect(result.body).toEqual('{"message":"Internal server error"}');
  });

  describe("successfully submit event types", () => {
    it.each(events.map((event) => [event.event, JSON.stringify(event)]))(
      "should successfully submit %s event",
      async (_, base) => {
        const event = {
          body: base,
          requestContext: getRequestContext(),
        } as unknown as APIGatewayEvent;
        const result = await submit(event);
        expect(result.statusCode).toEqual(200);
        expect(result.body).toEqual('{"message":"success"}');
      },
    );
  });
});
