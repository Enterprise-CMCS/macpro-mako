import { describe, it, expect } from "vitest";
import { submit } from "./index";
import { APIGatewayEvent } from "node_modules/shared-types";
import { getRequestContext, automatedStateSubmitter } from "mocks";
import { eventsAuthorizationRequired } from "mocks/data/submit/base";

describe("submit Lambda function with unauthorized submitter", () => {
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
