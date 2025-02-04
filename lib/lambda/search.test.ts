import { APIGatewayEvent, APIGatewayProxyEventPathParameters } from "aws-lambda";
import { getRequestContext, makoStateSubmitter } from "mocks";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { handler } from "./search";

describe("getSearchData Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call validateEnvVariable and return 400 if index path parameter is missing", async () => {
    const event = { pathParameters: {} } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(JSON.stringify({ message: "Index path parameter required" }));
  });

  it("should handle invalid JSON in request body", async () => {
    const event = {
      body: "invalid-json",
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(makoStateSubmitter),
    } as APIGatewayEvent;

    const res = await handler(event);
    expect(res.statusCode).toEqual(500);
    expect(JSON.parse(res.body)).toEqual({ message: "Invalid request body" });
  });

  it("should return 200 with search results", async () => {
    const event = {
      body: JSON.stringify({ query: { match_all: {} } }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(makoStateSubmitter),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);

    const body = JSON.parse(res.body);
    expect(body).toBeTruthy();
    expect(body?.hits?.hits).toBeTruthy();
    expect(body?.hits?.hits?.length).toEqual(22);
  });

  it("should handle errors during processing", async () => {
    const event = {
      body: JSON.stringify({ query: { match_all: { id: "throw-error" } } }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(makoStateSubmitter),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });
});
