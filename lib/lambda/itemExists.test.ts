import { APIGatewayEvent, Context } from "aws-lambda";
import {
  GET_ERROR_ITEM_ID,
  getRequestContext,
  HI_TEST_ITEM_ID,
  NOT_EXISTING_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  setMockUsername,
  TEST_ITEM_ID,
} from "mocks";
import { describe, expect, it } from "vitest";

import { handler } from "./itemExists";

describe("Handler for checking if record exists", () => {
  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
  });

  it("should return 400 if event body is not valid", async () => {
    const event = {
      body: JSON.stringify({ test: "bad " }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body)).toEqual(
      expect.objectContaining({ message: "Event failed validation" }),
    );
  });

  it("should return 400 if the item id not valid", async () => {
    const event = {
      body: JSON.stringify({ id: false }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body)).toEqual(
      expect.objectContaining({ message: "Event failed validation" }),
    );
  });

  it("should return 401 if not authenticated", async () => {
    setMockUsername(null);
    const event = {
      body: JSON.stringify({ id: HI_TEST_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(JSON.stringify({ message: "User is not authenticated" }));
  });

  it("should return 403 if not authorized to view this resource", async () => {
    const event = {
      body: JSON.stringify({ id: HI_TEST_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(403);
    expect(res.body).toEqual(JSON.stringify({ message: "Not authorized to view this resource" }));
  });

  it("should return 200 and exists: true if record is found", async () => {
    const event = {
      body: JSON.stringify({ id: TEST_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Record found for the given id", exists: true }),
    );
  });

  it("should return 200 and exists: false if no record is found", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_FOUND_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "No record found for the given id", exists: false }),
    );
  });

  it("should return 200 and exists: false if a 404 error occurs during processing", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_EXISTING_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "No record found for the given id", exists: false }),
    );
  });

  it("should return 200 and exists: false if an error occurs during processing", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ message: "No record found for the given id", exists: false }),
    );
  });
});
