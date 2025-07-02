import { APIGatewayEvent, Context } from "aws-lambda";
import {
  GET_ERROR_ITEM_ID,
  getRequestContext,
  HI_TEST_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  setMockUsername,
  WITHDRAWN_CHANGELOG_ITEM_ID,
} from "mocks";
import items from "mocks/data/items";
import { describe, expect, it } from "vitest";

import { handler } from "./item";

describe("getItemData Handler", () => {
  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Event body required" }));
  });

  it("should return 400 if event body is not valid", async () => {
    const event = {
      body: JSON.stringify({ test: "bad " }),
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

  it("should return 404 if the item is not found", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_FOUND_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual(JSON.stringify({ message: "No record found for the given id" }));
  });

  it("should return 200 with package data, children, and changelog if authorized", async () => {
    const packageData = items[WITHDRAWN_CHANGELOG_ITEM_ID];

    const event = {
      body: JSON.stringify({ id: WITHDRAWN_CHANGELOG_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify(packageData));
  });

  it("should return 500 if an error occurs during processing", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
