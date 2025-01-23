import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./updatePackage";
import { APIGatewayEvent } from "node_modules/shared-types";

import { EXISTING_ITEM_ID } from "mocks";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn((data) => data),
}));

describe("handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.topicName = "test-topic";
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;
    const result = await handler(event);
    const expectedResult = { statusCode: 400, body: { message: "Event body required" } };

    expect(result).toStrictEqual(expectedResult);
  });

  it("should return 400 if package ID is not found", async () => {
    const noActionevent = {
      body: JSON.stringify({ packageId: "123", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const resultPackage = await handler(noActionevent);
    expect(resultPackage?.statusCode).toBe(400);
  });

  it("should return 400 if action is not found", async () => {
    const noApackageEvent = {
      body: JSON.stringify({ action: "123", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const resultAction = await handler(noApackageEvent);

    expect(resultAction?.statusCode).toBe(400);
  });
  it("should get a package", async () => {
    const noActionevent = {
      body: JSON.stringify({ packageId: "123", action: "delete", changeReason: "Nunya" }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 404,
      body: { message: "No record found for the given id" },
    };
    expect(result).toStrictEqual(expectedResult);
  });
  it("should create a onemac package copy", async () => {
    const noActionevent = {
      body: JSON.stringify({
        packageId: EXISTING_ITEM_ID,
        action: "NOSO",
      }),
    } as APIGatewayEvent;

    const result = await handler(noActionevent);

    const expectedResult = {
      statusCode: 200,
      body: {
        message: `${EXISTING_ITEM_ID} has been submitted.`,
      },
    };
    expect(result).toStrictEqual(expectedResult);
  });
});
