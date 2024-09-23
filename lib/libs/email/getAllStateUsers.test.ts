import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { getAllStateUsers } from "./getAllStateUsers";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";

describe("getAllStateUsers", () => {
  const mockCognitoClient = new CognitoIdentityProviderClient();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch users successfully", async () => {
    const mockResponse = {
      Users: [
        {
          Attributes: [
            { Name: "given_name", Value: "John" },
            { Name: "family_name", Value: "Doe" },
            { Name: "email", Value: "john.doe@example.com" },
            { Name: "custom:state", Value: "CA" },
          ],
        },
      ],
    };
    (mockCognitoClient.send as Mock) = vi.fn().mockResolvedValue(mockResponse);

    // Mock the getAllStateUsers function
    (getAllStateUsers as Mock) = vi.fn().mockResolvedValue([
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        formattedEmailAddress: "John Doe <john.doe@example.com>",
      },
    ]);

    const result = await getAllStateUsers("CA");
    expect(result).toEqual([
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        formattedEmailAddress: "John Doe <john.doe@example.com>",
      },
    ]);
  });

  it("should return an empty array when no users are found", async () => {
    const mockResponse = { Users: [] };
    (mockCognitoClient.send as Mock) = vi.fn().mockResolvedValue(mockResponse);

    // Mock the getAllStateUsers function
    (getAllStateUsers as Mock) = vi.fn().mockResolvedValue([]);

    const result = await getAllStateUsers("CA");
    expect(result).toEqual([]);
  });

  it("should throw an error when there is an issue fetching users", async () => {
    (mockCognitoClient.send as Mock) = vi
      .fn()
      .mockRejectedValue(new Error("Error fetching users"));

    // Mock the getAllStateUsers function
    (getAllStateUsers as Mock) = vi
      .fn()
      .mockRejectedValue(new Error("Error fetching users"));

    await expect(getAllStateUsers("CA")).rejects.toThrow(
      "Error fetching users",
    );
  });
});
