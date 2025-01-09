import { describe, it, expect } from "vitest";
import { submit } from "./index";
import { APIGatewayEvent } from "node_modules/shared-types";
import { getRequestContext, automatedStateSubmitter } from "mocks";
import {
  events,
  eventsAttachmentRequired,
  eventsAuthorizationRequired,
} from "mocks/data/submit/base";

describe("submit Lambda function", () => {
  it("should have no body", async () => {
    const event = {} as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual('"Event body required"');
  });

  it("should have no event in the body", async () => {
    const event = {
      body: `{"event": ""}`,
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual('{"message":"Bad Request - Missing event name in body"}');
  });

  it("should have a bad event in the body", async () => {
    const event = {
      body: `{"event": "Not a real event"}`,
    } as unknown as APIGatewayEvent;
    const result = await submit(event);
    expect(result.statusCode).toEqual(400);
    expect(result.body).toEqual('{"message":"Bad Request - Unknown event type Not a real event"}');
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

  describe("fails if missing attachments", () => {
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

  describe("fails if not submitter is not authorized", () => {
    it.each(eventsAuthorizationRequired.map((event) => [event.event, JSON.stringify(event)]))(
      "should return a 500 if not authorized to submit %s event",
      async (_, base) => {
        const event = {
          body: base,
          requestContext: getRequestContext(automatedStateSubmitter),
        } as APIGatewayEvent;
        const result = await submit(event);
        expect(result.statusCode).toEqual(500);
        expect(result.body).toEqual('{"message":"Internal server error"}');
      },
    );
  });
});
