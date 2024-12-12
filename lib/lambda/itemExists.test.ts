import { APIGatewayEvent } from "aws-lambda";
import {
  GET_ERROR_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  TEST_ITEM_ID,
} from "mocks";
import { beforeEach, describe, expect, it } from "vitest";
import { handler } from "./itemExists";

describe("Handler for checking if record exists", () => {
  beforeEach(() => {
    process.env.osDomain = OPENSEARCH_DOMAIN;
    process.env.indexNamespace = OPENSEARCH_INDEX_NAMESPACE;
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
  });

  it("should return 200 and exists: true if record is found", async () => {
    const event = {
      body: JSON.stringify({ id: TEST_ITEM_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Record found for the given id", exists: true }),
    );
  });

  it("should return 200 and exists: false if no record is found", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_FOUND_ITEM_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "No record found for the given id", exists: false }),
    );
  });

  it("should return 500 if an error occurs during processing", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(
      JSON.stringify({ error: "Internal server error", message: "Response Error" }),
    );
  });
});
