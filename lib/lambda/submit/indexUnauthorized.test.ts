import { automatedStateSubmitter, getRequestContext } from "mocks";
import { eventsAuthorizationRequired } from "mocks/data/submit/base";
import { APIGatewayEvent } from "shared-types";
import { describe, expect, it } from "vitest";

import { submit } from "./index";

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
