import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler } from "./search";
import { response } from "libs/handler-lib";

import * as os from "../libs/opensearch-lib";
import { getAppkChildren } from "../libs/api/package";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn(),
}));

vi.mock("../libs/api/auth/user", () => ({
  getStateFilter: vi.fn(),
}));

vi.mock("../libs/opensearch-lib", () => ({
  search: vi.fn(),
}));

vi.mock("../libs/api/package", () => ({
  getAppkChildren: vi.fn(),
}));

describe("getSearchData Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.osDomain = "test-domain"; // Set the environment variable before each test
    process.env.indexNamespace = "test-namespace-"; // Set the environment variable before each test
  });

  it("should call validateEnvVariable and return 400 if index path parameter is missing", async () => {
    const event = { pathParameters: {} } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 400,
      body: { message: "Index path parameter required" },
    });
  });

  it("should return 200 with search results", async () => {
    const mockResults = {
      hits: {
        hits: [
          {
            _id: "1",
            _source: { appkParent: true },
          },
        ],
      },
    };

    (os.search as vi.Mock).mockResolvedValueOnce(mockResults);
    (getAppkChildren as vi.Mock).mockResolvedValueOnce({
      hits: {
        hits: [{ _id: "2", _source: { child: "child-data" } }],
      },
    });

    const event = {
      pathParameters: { index: "main" },
      body: JSON.stringify({ query: { match_all: {} } }),
    } as APIGatewayEvent;

    await handler(event);

    expect(os.search).toHaveBeenCalledWith(
      "test-domain",
      "test-namespace-main",
      expect.any(Object),
    );

    expect(getAppkChildren).toHaveBeenCalledWith("1");

    expect(response).toHaveBeenCalledWith({
      statusCode: 200,
      body: {
        hits: {
          hits: [
            {
              _id: "1",
              _source: {
                appkParent: true,
                appkChildren: [{ _id: "2", _source: { child: "child-data" } }],
              },
            },
          ],
        },
      },
    });
  });

  it("should handle errors during processing", async () => {
    (os.search as vi.Mock).mockRejectedValueOnce(new Error("Test error"));

    const event = {
      pathParameters: { index: "main" },
      body: JSON.stringify({ query: { match_all: {} } }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  });
});
