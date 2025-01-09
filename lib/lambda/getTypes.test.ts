import { describe, it, expect } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler } from "./getTypes";
import {
  CHIP_SPA_AUTHORITY_ID,
  MEDICAID_SPA_AUTHORITY_ID,
  NOT_FOUND_AUTHORITY_ID,
  ERROR_AUTHORITY_ID,
  medicaidTypes,
  chipTypes,
} from "mocks/data/types";
import { TestTypeItemResult } from "mocks";

describe("getTypes Handler", () => {
  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  // TODO - should this be removed? when will the result be empty and not
  // just a result with an empty hit array
  it.skip("should return 400 if no types are found", async () => {
    const event = {
      body: JSON.stringify({ authorityId: NOT_FOUND_AUTHORITY_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(
      JSON.stringify({ message: "No record found for the given authority" }),
    );
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

  it("should return 500 if an error occurs during processing", async () => {
    const event = {
      body: JSON.stringify({ authorityId: ERROR_AUTHORITY_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
