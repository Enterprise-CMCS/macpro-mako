import { APIGatewayEvent, APIGatewayProxyEventPathParameters } from "aws-lambda";
import * as osLib from "libs/opensearch-lib";
import { getRequestContext, helpDeskUser, noRoleUser, testStateSubmitter } from "mocks";
import { SMART_RECORD_TYPE } from "shared-types";
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

  it("should not include the draft index when the request opts out of drafts", async () => {
    const searchSpy = vi.spyOn(osLib, "search");
    const event = {
      body: JSON.stringify({ query: { match_all: {} }, includeDrafts: false }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(helpDeskUser),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    expect(
      searchSpy.mock.calls.some(([, index]) => String(index).includes("draftmain")),
    ).toBeFalsy();
    expect(
      searchSpy.mock.calls.some(([, , query]) => JSON.stringify(query).includes("includeDrafts")),
    ).toBeFalsy();
  });

  it("should include completed SMART packages while excluding SMART reservations", async () => {
    const searchSpy = vi.spyOn(osLib, "search");
    const event = {
      body: JSON.stringify({ query: { match_all: {} } }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(testStateSubmitter),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    const query = searchSpy.mock.calls
      .map(([, , searchQuery]) => searchQuery)
      .find((searchQuery) => JSON.stringify(searchQuery).includes("origin.keyword")) as any;
    const originAllowlist = {
      bool: {
        should: [
          { terms: { "origin.keyword": ["OneMAC", "OneMACLegacy"] } },
          {
            bool: {
              must: [
                { term: { "origin.keyword": "SMART" } },
                {
                  bool: {
                    should: [
                      { term: { smartRecordType: SMART_RECORD_TYPE.PACKAGE } },
                      { term: { "smartRecordType.keyword": SMART_RECORD_TYPE.PACKAGE } },
                    ],
                    minimum_should_match: 1,
                  },
                },
              ],
            },
          },
          {
            bool: {
              must: [
                { term: { "origin.keyword": "SEATool" } },
                { term: { "event.keyword": "NOSO" } },
              ],
            },
          },
        ],
      },
    };
    expect(query).toBeDefined();
    expect(query.query.bool.must).toContainEqual(originAllowlist);
    expect(JSON.stringify(originAllowlist)).toContain(SMART_RECORD_TYPE.PACKAGE);
    expect(JSON.stringify(originAllowlist)).not.toContain(SMART_RECORD_TYPE.RESERVATION);
  });

  it("should nest the caller query under the enforced state filter", async () => {
    const searchSpy = vi.spyOn(osLib, "search");
    const event = {
      body: JSON.stringify({
        query: { match_all: {} },
        aggs: { "state.keyword": { terms: { field: "state.keyword" } } },
      }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(testStateSubmitter),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(200);
    const query = searchSpy.mock.calls
      .map(([, , searchQuery]) => searchQuery)
      .find((searchQuery) => JSON.stringify(searchQuery).includes("origin.keyword")) as {
      query?: { match_all?: unknown; bool?: { must?: unknown[] } };
      aggs?: unknown;
    };
    expect(query.query?.match_all).toBeUndefined();
    expect(query.query?.bool?.must).toEqual(
      expect.arrayContaining([
        { match_all: {} },
        { terms: { state: ["va", "oh", "sc", "co", "ga", "md"] } },
      ]),
    );
    expect(query.aggs).toEqual({ "state.keyword": { terms: { field: "state.keyword" } } });
  });

  it.each([
    [
      "global aggregation",
      { aggs: { everything: { global: {}, aggs: { ids: { terms: { field: "_id" } } } } } },
    ],
    ["aggregations alias", { aggregations: { everything: { global: {} } } }],
    ["script fields", { script_fields: { t: { script: { source: "return 1+3" } } } }],
    [
      "nested script query",
      { query: { bool: { must: [{ script: { script: { source: "return true" } } }] } } },
    ],
    ["scripted metric", { aggs: { leak: { scripted_metric: { map_script: "state" } } } }],
    ["query wrapper", { query: { wrapper: { query: "e30=" } } }],
    [
      "terms lookup",
      { query: { terms: { state: { index: "main", id: "other-state", path: "state" } } } },
    ],
  ])("should reject a %s before searching", async (_label, body) => {
    const searchSpy = vi.spyOn(osLib, "search");
    const event = {
      body: JSON.stringify({ size: 1, track_total_hits: true, ...body }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(testStateSubmitter),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res.body)).toEqual({ message: "Query contains unsupported clauses" });
    expect(
      searchSpy.mock.calls.some(([, searchIndex]) => String(searchIndex).includes("main")),
    ).toBe(false);
  });

  it("should deny search when the user has no active role", async () => {
    const searchSpy = vi.spyOn(osLib, "search");
    const event = {
      body: JSON.stringify({ query: { match_all: {} } }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(noRoleUser),
    } as APIGatewayEvent;

    const res = await handler(event);

    expect(res.statusCode).toEqual(403);
    expect(JSON.parse(res.body)).toEqual({ message: "Not authorized to search" });
    expect(
      searchSpy.mock.calls.some(([, searchIndex]) => String(searchIndex).includes("main")),
    ).toBe(false);
  });
});
