import { STATE_CODES } from "shared-types/states";
import { FullUser } from "shared-types/user";
import { isCmsUser, isStateUser } from "shared-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUser } from "@/api";

import { getUserStateCodes, isAuthorizedState } from "./user";

// Mock users with different roles
const cmsReviewerUser = {
  "custom:cms-roles": "onemac-micro-reviewer",
  role: "cmsreviewer",
  states: [],
};

const stateSubmitterUser: FullUser = {
  sub: "12345678-1234-1234-1234-123456789012",
  email_verified: true,
  "custom:state": "CA",
  states: ["CA"],
  email: "stateuser@example.com",
  given_name: "State",
  family_name: "User",
  "custom:cms-roles": "",
  username: "stateuser",
  role: "statesubmitter",
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
    const result = getUserStateCodes(cmsReviewerUser as FullUser);
    expect(result).toEqual(STATE_CODES);
  });

  it("should return the state codes for a state user", () => {
    vi.mocked(isCmsUser).mockReturnValue(false);
    vi.mocked(isStateUser).mockReturnValue(true);
    const result = getUserStateCodes(stateSubmitterUser as FullUser);
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
      user: stateSubmitterUser as FullUser,
    });
    expect(await isAuthorizedState("CA-1234.R00.00")).toBe(true);
  });

  it("should throw an error if no cognito attributes are found", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getUser).mockResolvedValue({ user: null });

    const result = await isAuthorizedState("CA-1234.R00.00");

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error("No cognito attributes found."));
    consoleErrorSpy.mockRestore();
  });
});
