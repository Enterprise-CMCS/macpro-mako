import { STATE_CODES } from "shared-types/states";
import { getUser } from "@/api";
import { isCmsUser, isStateUser } from "shared-utils";
import { getUserStateCodes, isAuthorizedState } from "./user";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { type CognitoUserAttributes } from "shared-types/user";

// Mock users with different roles
const cmsReviewerUser = {
  "custom:cms-roles": "onemac-micro-reviewer",
};

const stateSubmitterUser: CognitoUserAttributes = {
  sub: "12345678-1234-1234-1234-123456789012",
  email_verified: true,
  "custom:state": "CA",
  email: "stateuser@example.com",
  given_name: "State",
  family_name: "User",
  "custom:cms-roles": "",
  username: "stateuser",
};

// Partial mock setup
vi.mock("./user", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(typeof actual === "object" && actual !== null ? actual : {}),
  };
});

vi.mock("@/api", () => ({
  getUser: vi.fn(),
}));

vi.mock("shared-utils", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(typeof actual === "object" && actual !== null ? actual : {}),
    isCmsUser: vi.fn(),
    isStateUser: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserStateCodes", () => {
  it("should return an empty array if the user is null", () => {
    expect(getUserStateCodes(null)).toEqual([]);
  });

  it("should return all state codes for a CMS user", () => {
    vi.mocked(isCmsUser).mockReturnValue(true);
    const result = getUserStateCodes(cmsReviewerUser as CognitoUserAttributes);
    expect(result).toEqual(STATE_CODES);
  });

  it("should return the state codes for a state user", () => {
    vi.mocked(isCmsUser).mockReturnValue(false);
    vi.mocked(isStateUser).mockReturnValue(true);
    const result = getUserStateCodes(
      stateSubmitterUser as CognitoUserAttributes,
    );
    expect(result).toEqual(["CA"]);
  });
});

describe("isAuthorizedState", () => {
  it("should return false if the user is null", async () => {
    expect(await isAuthorizedState("CA-1234.R00.00")).toBe(false);
  });

  it("should return false if the user is not authorized", async () => {
    expect(await isAuthorizedState("CA-1234.R00.00")).toBe(false);
  });

  it("should return true if the user is authorized", async () => {
    vi.mocked(getUser).mockResolvedValue({
      user: stateSubmitterUser as CognitoUserAttributes,
    });
    expect(await isAuthorizedState("CA-1234.R00.00")).toBe(true);
  });

  it("should throw an error if no cognito attributes are found", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    vi.mocked(getUser).mockResolvedValue({ user: null });

    const result = await isAuthorizedState("CA-1234.R00.00");

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      new Error("No cognito attributes found."),
    );
    consoleErrorSpy.mockRestore();
  });
});
