import { APIGatewayEvent, APIGatewayProxyEventPathParameters } from "aws-lambda";
import * as osLib from "libs/opensearch-lib";
import {
  getRequestContext,
  helpDeskUser,
  noRoleUser,
  nullStateSubmitter,
  TEST_SPA_ITEM_ID,
  testReviewer,
  testStateSubmitter,
} from "mocks";
import { SMART_RECORD_TYPE } from "shared-types";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as auth from "../libs/api/auth/user";
import { handler } from "./search";

const createSearchEvent = (
  body: unknown,
  user = testStateSubmitter,
  index = "main",
): APIGatewayEvent => ({
  body: JSON.stringify(body),
  pathParameters: { index },
  requestContext: getRequestContext(user),
  headers: {},
  multiValueHeaders: {},
  httpMethod: "POST",
  isBase64Encoded: false,
  path: `/search/${index}`,
  resource: "/search/{index}",
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
});

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
      body: JSON.stringify({ query: { match_all: {} } }),
      pathParameters: { index: "main" } as APIGatewayProxyEventPathParameters,
      requestContext: getRequestContext(testStateSubmitter),
    } as APIGatewayEvent;

    vi.spyOn(auth, "getSearchUserScope").mockResolvedValue({
      stateFilter: null,
      canViewDrafts: false,
    });
    vi.spyOn(osLib, "search").mockRejectedValueOnce(new Error("Search unavailable"));
    const res = await handler(event);

    expect(res).toBeTruthy();
    expect(res.statusCode).toEqual(500);
    expect(JSON.parse(res.body)).toEqual({ message: "Internal server error" });
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

  it.each([
    // The three queries from the penetration test report.
    {
      size: 0,
      query: { bool: { must: [{ match_all: {} }] } },
      track_total_hits: true,
      aggs: {
        everything: {
          global: {},
          aggs: {
            ids: {
              terms: { field: "_id", size: 3000 },
              aggs: { doc: { top_hits: { size: 1, _source: true } } },
            },
          },
        },
      },
    },
    {
      size: 1,
      query: { bool: { must: [{ match_all: {} }] } },
      script_fields: { t: { script: { source: "return 1+3" } } },
      track_total_hits: true,
    },
    {
      size: 0,
      query: { bool: { must: [{ match_all: {} }] } },
      track_total_hits: true,
      aggs: {
        everything: {
          global: {},
          aggs: {
            drafts: {
              filter: { term: { _index: "valdraftmain" } },
              aggs: {
                states: {
                  terms: { field: "state.keyword", size: 100 },
                  aggs: { docs: { top_hits: { size: 3, _source: true } } },
                },
              },
            },
          },
        },
      },
    },
    { aggregations: { everything: { global: {} } } },
    { aggs: { states: { terms: { field: "state.keyword" }, aggs: { docs: { top_hits: {} } } } } },
    { aggs: { states: { terms: { field: "state.keyword", script: "return 'CO'" } } } },
    { query: { bool: { filter: [{ script: { script: "true" } }] } } },
    { query: { terms: { state: { index: "valroles", id: "other-user", path: "states" } } } },
    { sort: [{ _script: { script: "1", type: "number" } }] },
    { ext: { arbitrary: {} } },
  ])("rejects unsupported query features before contacting OpenSearch: %j", async (body) => {
    const searchSpy = vi.spyOn(osLib, "search");
    const res = await handler(createSearchEvent(body));

    expect(res.statusCode).toBe(400);
    expect(searchSpy).not.toHaveBeenCalled();
  });

  it.each(["users", "roles", "draftmain", "main,*", "main,productionmain", "*", "../roles"])(
    "rejects an unsupported index before contacting OpenSearch: %s",
    async (index) => {
      const searchSpy = vi.spyOn(osLib, "search");
      const res = await handler(createSearchEvent({}, helpDeskUser, index));

      expect(res.statusCode).toBe(400);
      expect(searchSpy).not.toHaveBeenCalled();
    },
  );

  it.each(["{", "null", "[]", "true"])("rejects malformed search bodies: %s", async (body) => {
    const searchSpy = vi.spyOn(osLib, "search");
    const res = await handler({ ...createSearchEvent({}), body });

    expect(res.statusCode).toBe(400);
    expect(searchSpy).not.toHaveBeenCalled();
  });

  it.each([noRoleUser, nullStateSubmitter])(
    "returns 403 without searching packages when access is missing: $Username",
    async (user) => {
      const searchSpy = vi.spyOn(osLib, "search");
      const res = await handler(createSearchEvent({}, user));

      expect(res.statusCode).toBe(403);
      expect(searchSpy.mock.calls.every(([, index]) => !String(index).includes("main"))).toBe(true);
    },
  );

  it("keeps changelog searches scoped to the user's states without including the draft index", async () => {
    const searchSpy = vi.spyOn(osLib, "search");
    const res = await handler(
      createSearchEvent(
        {
          query: { bool: { must: [{ term: { "packageId.keyword": TEST_SPA_ITEM_ID } }] } },
        },
        testStateSubmitter,
        "changelog",
      ),
    );

    expect(res.statusCode).toBe(200);
    const call = searchSpy.mock.calls.find(([, index]) => String(index).endsWith("changelog"));
    expect(call).toBeDefined();
    expect(call![2].query.bool.must).toContainEqual({
      terms: { state: testStateSubmitter.states!.map((state) => state.toLowerCase()) },
    });
    expect(searchSpy.mock.calls.some(([, index]) => String(index).includes("draftmain"))).toBe(
      false,
    );
  });

  it.each([
    { user: testStateSubmitter, includeDrafts: true, drafts: true },
    { user: testStateSubmitter, includeDrafts: false, drafts: false },
    { user: testReviewer, includeDrafts: true, drafts: false },
    { user: helpDeskUser, includeDrafts: true, drafts: true },
    { user: helpDeskUser, includeDrafts: false, drafts: false },
  ])(
    "preserves draft access for $user.role, includeDrafts=$includeDrafts",
    async ({ user, includeDrafts, drafts }) => {
      const searchSpy = vi.spyOn(osLib, "search");
      const res = await handler(createSearchEvent({ includeDrafts }, user));

      expect(res.statusCode).toBe(200);
      const call = searchSpy.mock.calls.find(([, index]) => String(index).includes("main"));
      expect(call).toBeDefined();
      expect(String(call![1]).includes("draftmain")).toBe(drafts);
      if (user === testStateSubmitter) {
        expect(call![2].query.bool.must).toContainEqual({
          terms: { state: testStateSubmitter.states!.map((state) => state.toLowerCase()) },
        });
      }
      if (user === testReviewer) {
        expect(call![2].query.bool.must_not).toContainEqual({
          term: { "seatoolStatus.keyword": "Draft" },
        });
      }
    },
  );

  it("applies package access rules to child lookups without applying the parent's UI filters", async () => {
    vi.spyOn(auth, "getSearchUserScope").mockResolvedValue({
      stateFilter: { terms: { state: ["md"] } },
      canViewDrafts: false,
    });
    const searchSpy = vi
      .spyOn(osLib, "search")
      .mockResolvedValueOnce({
        hits: {
          hits: [
            {
              _id: "MD-parent",
              _source: {
                appkParent: true,
                appkChildren: [{ _source: { state: "CO" } }],
              },
            },
          ],
        },
      })
      .mockResolvedValueOnce({ hits: { hits: [] } });
    const res = await handler(
      createSearchEvent({
        query: { bool: { must: [{ term: { "id.keyword": "MD-parent" } }] } },
      }),
    );

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).hits.hits[0]._source.appkChildren).toEqual([]);
    expect(searchSpy).toHaveBeenCalledTimes(2);
    const parentQuery = searchSpy.mock.calls[0][2];
    const childQuery = searchSpy.mock.calls[1][2];
    expect(childQuery.query.bool.must[0]).toEqual({
      term: { "appkParentId.keyword": "MD-parent" },
    });
    const accessQuery = childQuery.query.bool.must[1];
    expect(accessQuery.bool.must).toEqual(parentQuery.query.bool.must.slice(1, -1));
    expect(accessQuery.bool.must).toContainEqual({ terms: { state: ["md"] } });
    expect(accessQuery.bool.must_not).toEqual(
      expect.arrayContaining(parentQuery.query.bool.must_not),
    );
    expect(accessQuery.bool.must_not).toContainEqual({ term: { deleted: true } });
    expect(accessQuery.bool.must_not).toContainEqual({
      bool: {
        must: [{ term: { "origin.keyword": "SMART" } }],
        must_not: [
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
    });
  });
});
