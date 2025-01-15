import { describe, it, expect } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler } from "./getSubTypes";
import {
  MEDICAID_SPA_AUTHORITY_ID,
  CHIP_SPA_AUTHORITY_ID,
  NOT_FOUND_AUTHORITY_ID,
  TYPE_ONE_ID,
  TYPE_TWO_ID,
  TYPE_THREE_ID,
  DO_NOT_USE_TYPE_ID,
  medicaidSubtypes,
  chipSubtypes,
} from "mocks/data/types";
import { TestSubtypeItemResult, errorSubtypeSearchHandler } from "mocks";
import { mockedServiceServer as mockedServer } from "mocks/server";

describe("getSubTypes Handler", () => {
  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 400 if authority id is undefined", async () => {
    const event = {
      body: JSON.stringify({
        authorityId: undefined,
        typeIds: [TYPE_ONE_ID, TYPE_TWO_ID],
      }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Authority Id is required" }));
  });

  it("should return 500 if there is a server error", async () => {
    mockedServer.use(errorSubtypeSearchHandler);

    const event = {
      body: JSON.stringify({
        authorityId: MEDICAID_SPA_AUTHORITY_ID,
        typeIds: [TYPE_ONE_ID, TYPE_TWO_ID],
      }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 200 and no hits if no subtypes are found", async () => {
    const event = {
      body: JSON.stringify({
        authorityId: NOT_FOUND_AUTHORITY_ID,
        typeIds: [TYPE_ONE_ID, TYPE_TWO_ID],
      }),
    } as APIGatewayEvent;

    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(body.hits.hits).toEqual([]);
  });

  it("should return 200 with the result if subtypes are found", async () => {
    const event = {
      body: JSON.stringify({
        authorityId: MEDICAID_SPA_AUTHORITY_ID,
        typeIds: [TYPE_ONE_ID, TYPE_TWO_ID],
      }),
    } as APIGatewayEvent;

    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(body.hits.hits).toEqual(medicaidSubtypes);
  });

  it("should filter out types with names that include Do Not Use", async () => {
    const event = {
      body: JSON.stringify({
        authorityId: CHIP_SPA_AUTHORITY_ID,
        typeIds: [TYPE_THREE_ID, DO_NOT_USE_TYPE_ID],
      }),
    } as APIGatewayEvent;

    const res = await handler(event);
    const body = JSON.parse(res.body);

    expect(res.statusCode).toEqual(200);
    expect(body.hits.hits).toEqual(chipSubtypes);
    body.hits.hits.forEach((type: TestSubtypeItemResult) => {
      expect(type?._source?.name).toBeTruthy();
      expect(type?._source?.name?.match(/Do Not Use/)).toBeFalsy();
    });
  });
});
