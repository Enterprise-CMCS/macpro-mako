import { APIGatewayEvent } from "aws-lambda";
import { GET_ERROR_ITEM_ID, NOT_FOUND_ITEM_ID, TEST_ITEM_ID, NOT_EXISTING_ITEM_ID } from "mocks";
import { describe, expect, it } from "vitest";
import { handler } from "./itemExists";

describe("Handler for checking if record exists", () => {
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

  it("should return 200 and exists: false if a 404 error occurs during processing", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_EXISTING_ITEM_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "No record found for the given id", exists: false }),
    );
  });

  it("should return 500 error occurs during processing", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
