import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler } from "./item";
import { response } from "../libs/handler-lib";
import { getStateFilter } from "../libs/api/auth/user";
import {
  getAppkChildren,
  getPackage,
  getPackageChangelog,
} from "../libs/api/package";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn(),
}));

vi.mock("../libs/api/auth/user", () => ({
  getStateFilter: vi.fn(),
}));

vi.mock("../libs/api/package", () => ({
  getAppkChildren: vi.fn(),
  getPackage: vi.fn(),
  getPackageChangelog: vi.fn(),
}));

describe("getItemData Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.osDomain = "test-domain"; // Set the environment variable before each test
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  });

  it("should return 401 if not authorized to view this resource", async () => {
    const packageData = { found: true, _source: { state: "test-state" } };
    (getPackage as Mock).mockResolvedValueOnce(packageData);
    (getStateFilter as Mock).mockResolvedValueOnce({
      terms: { state: ["other-state"] },
    });

    const event = {
      body: JSON.stringify({ id: "test-id" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 401,
      body: { message: "Not authorized to view this resource" },
    });
  });

  it("should return 200 with package data, children, and changelog if authorized", async () => {
    const packageData = {
      found: true,
      _source: {
        state: "test-state",
        appkParent: true,
        legacySubmissionTimestamp: null,
      },
    };
    const childrenData = {
      hits: { hits: [{ _source: { child: "child-data" } }] },
    };
    const changelogData = {
      hits: { hits: [{ _source: { change: "change-data" } }] },
    };

    (getPackage as Mock).mockResolvedValueOnce(packageData);
    (getStateFilter as Mock).mockResolvedValueOnce({
      terms: { state: ["test-state"] },
    });
    (getAppkChildren as Mock).mockResolvedValueOnce(childrenData);
    (getPackageChangelog as Mock).mockResolvedValueOnce(changelogData);

    const event = {
      body: JSON.stringify({ id: "test-id" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 200,
      body: {
        ...packageData,
        _source: {
          ...packageData._source,
          appkChildren: childrenData.hits.hits,
          changelog: changelogData.hits.hits,
        },
      },
    });
  });

  it("should return 500 if an error occurs during processing", async () => {
    (getPackage as Mock).mockRejectedValueOnce(new Error("Test error"));

    const event = {
      body: JSON.stringify({ id: "test-id" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 500,
      body: { message: "Internal server error" },
    });
  });
});
