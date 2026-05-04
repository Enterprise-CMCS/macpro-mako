import { APIGatewayEvent, APIGatewayProxyEventPathParameters } from "aws-lambda";
import * as osLib from "libs/opensearch-lib";
import { getRequestContext, helpDeskUser, testStateSubmitter } from "mocks";
import { afterEach, describe, expect, it, vi } from "vitest";

import { handler } from "./search";

describe("getSearchData Handler", () => {
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

  it("should return 200 with search results", async () => {
    const event = {
      body: JSON.stringify({ query: { match_all: {} } }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(testStateSubmitter),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);

    const body = JSON.parse(res.body);
    expect(body).toBeTruthy();
    expect(body?.hits?.hits).toBeTruthy();
    expect(body?.hits?.hits?.length).toEqual(32);
  });

  it("should handle errors during processing", async () => {
    const event = {
      body: JSON.stringify({ query: { match_all: { id: "throw-error" } } }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(testStateSubmitter),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(res.body).toEqual(JSON.stringify({ message: "Internal server error" }));
  });

  it("should include the draft index for Helpdesk users searching main", async () => {
    const searchSpy = vi.spyOn(osLib, "search");
    const event = {
      body: JSON.stringify({ query: { match_all: {} } }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(helpDeskUser),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(
      searchSpy.mock.calls.some(([, index]) => String(index).includes("draftmain")),
    ).toBeTruthy();
  });
});
