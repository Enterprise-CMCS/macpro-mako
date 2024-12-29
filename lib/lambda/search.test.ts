import { APIGatewayEvent, APIGatewayProxyEventPathParameters } from "aws-lambda";
import { getRequestContext, makoStateSubmitter } from "mocks";
import { describe, expect, it } from "vitest";
import { handler } from "./search";

describe("getSearchData Handler", () => {
  it("should call validateEnvVariable and return 400 if index path parameter is missing", async () => {
    const event = { pathParameters: {} } as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: "Index path parameter required" });
  });

  it.skip("should return 200 with search results", async () => {
    const event = {
      body: {
        query: {
          match_all: {},
        },
      },
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(makoStateSubmitter),
    } as unknown as APIGatewayEvent;

    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(200);

    const body = res.body;
    expect(body).toBeTruthy();
    expect(body?.hits?.hits).toBeTruthy();
    expect(body?.hits?.hits?.length).toEqual(11);
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
    expect(res.body).toEqual({ error: "Internal server error", message: "Response Error" });
  });
});
