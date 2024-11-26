import { APIGatewayEvent } from "aws-lambda";
import { ERROR_ITEM_ID, NOT_FOUND_ITEM_ID, TEST_ITEM_ID } from "mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as lib from "../libs/handler-lib";
import { handler } from "./itemExists";

const response = vi.spyOn(lib, "response");

describe("Handler for checking if record exists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.osDomain = "test-domain"; // Set the environment variable before each test
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    const response = await handler(event);

    expect(response).not.toBeNull();
    expect(response?.body).toContain("Event body required");
    expect(response?.statusCode).toEqual(400);
  });

  it("should return 200 and exists: true if record is found", async () => {
    const event = {
      body: JSON.stringify({ id: TEST_ITEM_ID }),
    } as APIGatewayEvent;

    const response = await handler(event);

    expect(response).not.toBeNull();
    expect(JSON.parse(response?.body)).toContainEqual({
      message: "Record found for the given id",
      exists: true,
    });
    expect(response?.statusCode).toEqual(200);
  });

  it("should return 200 and exists: false if no record is found", async () => {
    const event = {
      body: JSON.stringify({ id: NOT_FOUND_ITEM_ID }),
    } as APIGatewayEvent;

    const response = await handler(event);

    expect(response).not.toBeNull();
    expect(JSON.parse(response?.body)).toContainEqual({
      message: "No record found for the given id",
      exists: false,
    });
    expect(response?.statusCode).toEqual(200);
  });

  it.skip("should return 500 if an error occurs during processing", async () => {
    const event = {
      body: JSON.stringify({ id: ERROR_ITEM_ID }),
    } as APIGatewayEvent;

    const response = await handler(event);

    expect(response).toContainEqual({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  });
});
