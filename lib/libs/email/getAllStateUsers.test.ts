import { getAllStateUsers } from "./getAllStateUsers";
import { describe, it, expect, beforeEach, vi } from "vitest";

// vi.mock("./getAllStateUsers");

vi.mock("@aws-sdk/client-cognito-identity-provider", () => {
  const users_one = {
    Users: [
      {
        Attributes: [
          { Name: "email", Value: "john.doe@example.com" },
          { Name: "custom:state", Value: "VA" },
          { Name: "given_name", Value: "John" },
          { Name: "family_name", Value: "Doe" },
        ],
      },
    ],
  };
  const users_none = { Users: [] };
  const send = vi
    .fn()
    .mockReturnValueOnce(users_one)
    .mockReturnValueOnce(users_none)
    .mockRejectedValue("Bad");

  return {
    CognitoIdentityProviderClient: vi.fn(() => ({
      send,
    })),
    ListUsersCommand: vi.fn(),
  };
});
describe("getAllStateUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch  a user", async () => {
    const test = await getAllStateUsers({ userPoolId: "1", state: "VA" });

    expect(test).toStrictEqual([
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        formattedEmailAddress: "John Doe <john.doe@example.com>",
      },
    ]);
  });

  it("should return an empty array when no users are found", async () => {
    const test = await getAllStateUsers({ userPoolId: "1", state: "TX" });

    expect(test).toStrictEqual([]);
  });

  it("should throw an error when there is an issue fetching users", async () => {
    await expect(getAllStateUsers({ userPoolId: "1", state: "TX" })).rejects.toThrowError();
  });
});
