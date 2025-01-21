import { APIGatewayEvent } from "aws-lambda";
import { Action } from "shared-types";
import { getRequestContext } from "mocks";
import {
  GET_ERROR_ITEM_ID,
  HI_TEST_ITEM_ID,
  NOT_FOUND_ITEM_ID,
  WITHDRAWN_CHANGELOG_ITEM_ID,
  INITIAL_RELEASE_APPK_ITEM_ID,
} from "mocks/data/items";
import { describe, expect, it } from "vitest";
import { handler } from "./getPackageActions";

describe("getPackageActions Handler", () => {
  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
  });

  it("should return 500 if event body is invalid", async () => {
    const event = {
      body: {},
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should return 401 if not authorized to view resources from the state", async () => {
    const event = {
      body: JSON.stringify({ id: HI_TEST_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual(
      JSON.stringify({ message: "Not authorized to view resources from this state" }),
    );
  });

  it("should return 404 if the package is not found", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_FOUND_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual(JSON.stringify({ message: "No record found for the given id" }));
  });

  it("should return 200 with available actions if authorized and package is found and has no app-k", async () => {
    const event = {
      body: JSON.stringify({ id: WITHDRAWN_CHANGELOG_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({ actions: [] }));
  });

  it("should return 200 with available actions if authorized and package is found and has app-k", async () => {
    const event = {
      body: JSON.stringify({ id: INITIAL_RELEASE_APPK_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      JSON.stringify({ actions: [Action.WITHDRAW_PACKAGE, Action.UPLOAD_SUBSEQUENT_DOCUMENTS] }),
    );
  });

  it("should handle errors during processing", async () => {
    const event = {
      body: JSON.stringify({ id: GET_ERROR_ITEM_ID }),
      requestContext: getRequestContext(),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
