import { getAllStateUsers } from "../getAllStateUsers";
import { ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
import { vi, describe, it, expect } from "vitest";

vi.mock("@aws-sdk/client-cognito-identity-provider", async () => {
  const actual = await vi.importActual("@aws-sdk/client-cognito-identity-provider");
  return {
    ...actual,
    CognitoIdentityProviderClient: vi.fn().mockImplementation(() => {
      return {
        send: vi.fn().mockImplementation((cmd: any) => {
          if (cmd instanceof ListUsersCommand) {
            return Promise.resolve({
              Users: [
                {
                  Username: "user1",
                  Attributes: [
                    { Name: "given_name", Value: "John" },
                    { Name: "family_name", Value: "Doe" },
                    { Name: "email", Value: "john@example.com" },
                    { Name: "custom:state", Value: "CO,NY" },
                  ],
                },
                {
                  Username: "user2",
                  Attributes: [
                    { Name: "given_name", Value: "Jane" },
                    { Name: "family_name", Value: "Smith" },
                    { Name: "email", Value: "jane@example.com" },
                    { Name: "custom:state", Value: "CA,CO" },
                  ],
                },
              ],
            });
          }
          return Promise.resolve({});
        }),
      };
    }),
  };
});

describe("getAllStateUsers", () => {
  it("returns users for given state", async () => {
    const users = await getAllStateUsers({ userPoolId: "testPool", state: "CO" });
    expect(users).toHaveLength(2);
    expect(users[0].email).toBe("john@example.com");
    expect(users[1].email).toBe("jane@example.com");
  });

  it("returns empty if no user matches the state", async () => {
    const users = await getAllStateUsers({ userPoolId: "testPool", state: "ZZ" });
    expect(users).toHaveLength(0);
  });
});
