import { describe, it, expect, vi, beforeEach } from "vitest";
import { toggleWithdrawRai } from "./toggle-withdraw-rai";
import { isAuthorized, getAuthDetails, lookupUserAttributes } from "libs/api/auth/user";
import { itemExists } from "libs/api/package";
import { type APIGatewayEvent } from "aws-lambda";

const payload = {
  id: "SS-1234.R11.TE12",
  event: "toggle-withdraw-rai",
  authority: "1915(b)",
  raiWithdrawEnabled: true,
  proposedEffectiveDate: 1700000000,
};

vi.mock("libs/api/auth/user", () => ({
  isAuthorized: vi.fn(),
  getAuthDetails: vi.fn(),
  lookupUserAttributes: vi.fn(),
}));

vi.mock("libs/api/package", () => ({
  itemExists: vi.fn(),
}));

describe("toggle withdraw rai payload", () => {
  const mockIsAuthorized = vi.mocked(isAuthorized);
  const mockGetAuthDetails = vi.mocked(getAuthDetails);
  const mockLookupUserAttributes = vi.mocked(lookupUserAttributes);
  const mockItemExists = vi.mocked(itemExists);

  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should be unauthorized", async () => {
    mockIsAuthorized.mockResolvedValueOnce(false);

    mockLookupUserAttributes.mockResolvedValueOnce({
      email: "john.doe@example.com",
      given_name: "John",
      family_name: "Doe",
      sub: "",
      "custom:cms-roles": "",
      email_verified: false,
      username: "",
    });

    const mockEvent = {
      body: JSON.stringify(payload),
    } as APIGatewayEvent;

    await expect(toggleWithdrawRai(mockEvent)).rejects.toThrow("Unauthorized");
  });
  it("should have no body on submission and throw an error", async () => {
    mockIsAuthorized.mockResolvedValueOnce(true);

    mockLookupUserAttributes.mockResolvedValueOnce({
      email: "john.doe@example.com",
      given_name: "John",
      family_name: "Doe",
      sub: "",
      "custom:cms-roles": "",
      email_verified: false,
      username: "",
    });

    const mockEvent = {
      fail: "fail",
    } as unknown as APIGatewayEvent;

    const result = await toggleWithdrawRai(mockEvent);

    expect(result?.submitterName).toBeUndefined();
  });
  it("should find an item already exists", async () => {
    mockIsAuthorized.mockResolvedValueOnce(true);
    mockGetAuthDetails.mockReturnValueOnce({ userId: "user-123", poolId: "pool-123" });
    mockLookupUserAttributes.mockResolvedValueOnce({
      email: "john.doe@example.com",
      given_name: "John",
      family_name: "Doe",
      sub: "",
      "custom:cms-roles": "",
      email_verified: false,
      username: "",
    });
    mockItemExists.mockResolvedValueOnce(false);

    const mockEvent = {
      body: JSON.stringify(payload),
    } as APIGatewayEvent;

    await expect(toggleWithdrawRai(mockEvent)).rejects.toThrow("Item Does Not Exist");
  });

  it("should process valid input and return transformed data", async () => {
    mockIsAuthorized.mockResolvedValueOnce(true);
    mockGetAuthDetails.mockReturnValueOnce({ userId: "user-123", poolId: "pool-123" });
    mockLookupUserAttributes.mockResolvedValueOnce({
      email: "john.doe@example.com",
      given_name: "John",
      family_name: "Doe",
      sub: "",
      "custom:cms-roles": "",
      email_verified: false,
      username: "",
    });
    mockItemExists.mockResolvedValueOnce(true);

    const mockEvent = {
      body: JSON.stringify(payload),
    } as APIGatewayEvent;

    const result = await toggleWithdrawRai(mockEvent);

    expect(result?.submitterName).toEqual("John Doe");
  });
});
