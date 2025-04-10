import { APIGatewayEvent } from "aws-lambda";
import { errorOSTypeSearchHandler, TestTypeItemResult } from "mocks";
import {
  CHIP_SPA_AUTHORITY_ID,
  chipTypes,
  MEDICAID_SPA_AUTHORITY_ID,
  medicaidTypes,
  NOT_FOUND_AUTHORITY_ID,
} from "mocks/data/types";
import { mockedServiceServer as mockedServer } from "mocks/server";
import { describe, expect, it } from "vitest";

import { handler } from "./getTypes";

describe("getTypes Handler", () => {
  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 400 if authority id is undefined", async () => {
    const event = {
      body: JSON.stringify({ authorityId: undefined }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Authority Id is required" }));
  });

  it("should return 500 if there is a server error", async () => {
    mockedServer.use(errorOSTypeSearchHandler);

    const event = {
      body: JSON.stringify({ authorityId: MEDICAID_SPA_AUTHORITY_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 200 and no hits if no types are found", async () => {
    const event = {
      body: JSON.stringify({ authorityId: NOT_FOUND_AUTHORITY_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(body.hits.hits).toEqual([]);
  });

  it("should return 200 with the result if types are found", async () => {
    const event = {
      body: JSON.stringify({ authorityId: MEDICAID_SPA_AUTHORITY_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(body.hits.hits).toEqual(medicaidTypes);
  });

  it("should filter out types with names that include Do Not Use", async () => {
    const event = {
      body: JSON.stringify({ authorityId: CHIP_SPA_AUTHORITY_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(body.hits.hits).toEqual(chipTypes);
    body.hits.hits.forEach((type: TestTypeItemResult) => {
      expect(type?._source?.name).toBeTruthy();
      expect(type?._source?.name?.match(/Do Not Use/)).toBeFalsy();
    });
  });
});
