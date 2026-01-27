import { APIGatewayEvent, Context } from "aws-lambda";
import * as checkIdentifierUsageLib from "libs/api/package/checkIdentifierUsage";
import { NOT_FOUND_ITEM_ID, TEST_ITEM_ID } from "mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "./checkIdentifierUsage";

// Mock the checkIdentifierUsage function
vi.mock("libs/api/package/checkIdentifierUsage", () => ({
  checkIdentifierUsage: vi.fn(),
}));

describe("checkIdentifierUsage handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if id parameter is missing", async () => {
    const event = {
      queryStringParameters: null,
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(400);
    const body = JSON.parse(res.body);
    expect(body.message).toContain("Missing required parameter: id");
  });

  it("should return 400 if id parameter is empty string", async () => {
    const event = {
      queryStringParameters: { id: "" },
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(400);
    const body = JSON.parse(res.body);
    expect(body.message).toContain("Missing required parameter: id");
  });

  it("should return 200 with inUse: false when identifier is available", async () => {
    vi.mocked(checkIdentifierUsageLib.checkIdentifierUsage).mockResolvedValue({
      exists: false,
    });

    const event = {
      queryStringParameters: { id: "MD-NEW-123" },
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual({
      inUse: false,
    });
    expect(checkIdentifierUsageLib.checkIdentifierUsage).toHaveBeenCalledWith("MD-NEW-123");
  });

  it("should return 200 with inUse: true and system when identifier exists with OneMAC origin", async () => {
    vi.mocked(checkIdentifierUsageLib.checkIdentifierUsage).mockResolvedValue({
      exists: true,
      origin: "OneMAC",
    });

    const event = {
      queryStringParameters: { id: TEST_ITEM_ID },
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual({
      inUse: true,
      system: "OneMAC",
    });
  });

  it("should return 200 with inUse: true and system when identifier exists with SEATool origin", async () => {
    vi.mocked(checkIdentifierUsageLib.checkIdentifierUsage).mockResolvedValue({
      exists: true,
      origin: "SEATool",
    });

    const event = {
      queryStringParameters: { id: "MD-EXISTING-123" },
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual({
      inUse: true,
      system: "SEATool",
    });
  });

  it("should return 200 with inUse: true and system when identifier exists with WMS origin", async () => {
    vi.mocked(checkIdentifierUsageLib.checkIdentifierUsage).mockResolvedValue({
      exists: true,
      origin: "WMS",
    });

    const event = {
      queryStringParameters: { id: "MD-WMS-123" },
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual({
      inUse: true,
      system: "WMS",
    });
  });

  it("should return 200 with inUse: true and system when identifier exists with SMART origin", async () => {
    vi.mocked(checkIdentifierUsageLib.checkIdentifierUsage).mockResolvedValue({
      exists: true,
      origin: "SMART",
    });

    const event = {
      queryStringParameters: { id: "MD-SMART-123" },
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual({
      inUse: true,
      system: "SMART",
    });
  });

  it("should return 200 with inUse: true and system when identifier exists with OneMACLegacy origin", async () => {
    vi.mocked(checkIdentifierUsageLib.checkIdentifierUsage).mockResolvedValue({
      exists: true,
      origin: "OneMACLegacy",
    });

    const event = {
      queryStringParameters: { id: "MD-LEGACY-123" },
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(200);
    const body = JSON.parse(res.body);
    expect(body).toEqual({
      inUse: true,
      system: "OneMACLegacy",
    });
  });

  it("should return 500 on internal server error", async () => {
    vi.mocked(checkIdentifierUsageLib.checkIdentifierUsage).mockRejectedValue(
      new Error("OpenSearch error"),
    );

    const event = {
      queryStringParameters: { id: "MD-ERROR-123" },
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.statusCode).toEqual(500);
    const body = JSON.parse(res.body);
    expect(body.message).toEqual("Internal server error");
  });

  it("should include CORS headers in response", async () => {
    vi.mocked(checkIdentifierUsageLib.checkIdentifierUsage).mockResolvedValue({
      exists: false,
    });

    const event = {
      queryStringParameters: { id: "MD-TEST-123" },
      requestContext: {
        requestId: "test-request-id",
      },
    } as unknown as APIGatewayEvent;

    const res = await handler(event, {} as Context);

    expect(res.headers).toBeDefined();
    expect(res.headers["Access-Control-Allow-Origin"]).toEqual("*");
    expect(res.headers["Access-Control-Allow-Methods"]).toContain("GET");
  });
});
