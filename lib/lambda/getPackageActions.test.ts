import { describe, it, expect, vi, beforeEach } from "vitest";
import { APIGatewayEvent } from "aws-lambda";
import { handler, getPackageActions } from "./getPackageActions";
import { response } from "libs/handler-lib";
import { getAvailableActions } from "shared-utils";
import { getPackage } from "../libs/api/package/getPackage";
import {
  getAuthDetails,
  isAuthorizedToGetPackageActions,
  lookupUserAttributes,
} from "../libs/api/auth/user";

vi.mock("libs/handler-lib", () => ({
  response: vi.fn(),
}));

vi.mock("shared-utils", () => ({
  getAvailableActions: vi.fn(),
}));

vi.mock("../libs/api/package/getPackage", () => ({
  getPackage: vi.fn(),
}));

vi.mock("../libs/api/auth/user", () => ({
  getAuthDetails: vi.fn(),
  isAuthorizedToGetPackageActions: vi.fn(),
  lookupUserAttributes: vi.fn(),
}));

describe("getPackageActions Handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if event body is missing", async () => {
    const event = {} as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  });

  it("should return 401 if not authorized to view resources from the state", async () => {
    const packageData = { found: true, _source: { state: "test-state" } };
    (getPackage as vi.Mock).mockResolvedValueOnce(packageData);
    (isAuthorizedToGetPackageActions as vi.Mock).mockResolvedValueOnce(false);

    const event = {
      body: JSON.stringify({ id: "test-id" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 401,
      body: { message: "Not authorized to view resources from this state" },
    });
  });

  it("should return 200 with available actions if authorized and package is found", async () => {
    const packageData = { found: true, _source: { state: "test-state" } };
    const userAttributes = { userId: "test-user", poolId: "test-pool" };
    const actions = ["action1", "action2"];
    (getPackage as vi.Mock).mockResolvedValueOnce(packageData);
    (isAuthorizedToGetPackageActions as vi.Mock).mockResolvedValueOnce(true);
    (getAuthDetails as vi.Mock).mockReturnValueOnce(userAttributes);
    (lookupUserAttributes as vi.Mock).mockResolvedValueOnce(userAttributes);
    (getAvailableActions as vi.Mock).mockReturnValueOnce(actions);

    const event = {
      body: JSON.stringify({ id: "test-id" }),
    } as APIGatewayEvent;

    await handler(event);

    expect(response).toHaveBeenCalledWith({
      statusCode: 200,
      body: { actions },
    });
  });

  it("should handle errors during processing", async () => {
    (getPackage as vi.Mock).mockRejectedValueOnce(new Error("Test error"));

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
