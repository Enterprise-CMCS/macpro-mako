import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAuthDetails,
  lookupUserAttributes,
  isAuthorized,
  isAuthorizedToGetPackageActions,
  getStateFilter,
} from "./user";
import { APIGatewayEvent } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  UserType as CognitoUserType,
} from "@aws-sdk/client-cognito-identity-provider";

vi.mock("@aws-sdk/client-cognito-identity-provider", () => {
  const send = vi.fn();
  return {
    CognitoIdentityProviderClient: vi.fn(() => ({
      send,
    })),
    ListUsersCommand: vi.fn(),
  };
});

describe("Auth functions", () => {
  let event: APIGatewayEvent;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    event = {
      requestContext: {
        identity: {
          cognitoAuthenticationProvider:
            "cognito-idp.us-east-1.amazonaws.com/us-east-1_ABC123,cognito-idp.us-east-1.amazonaws.com/us-east-1_ABC123:CognitoSignIn:12345678-1234-1234-1234-123456789012",
        },
      },
    } as unknown as APIGatewayEvent;

    const client = new CognitoIdentityProviderClient({});
    mockSend = vi.mocked(client.send);
  });

  describe("getAuthDetails", () => {
    it("should return the correct auth details", () => {
      const authDetails = getAuthDetails(event);
      expect(authDetails).toEqual({
        userId: "12345678-1234-1234-1234-123456789012",
        poolId: "us-east-1_ABC123",
      });
    });

    it("should throw an error if no auth provider is present", () => {
      event.requestContext.identity.cognitoAuthenticationProvider = "";
      expect(() => getAuthDetails(event)).toThrow("No auth provider!");
    });
  });

  describe("lookupUserAttributes", () => {
    it("should return user attributes", async () => {
      const mockUser = {
        Username: "testuser",
        Attributes: [
          { Name: "sub", Value: "12345678-1234-1234-1234-123456789012" },
          { Name: "custom:state", Value: "NY" },
        ],
      } as CognitoUserType;
      mockSend.mockResolvedValueOnce({
        Users: [mockUser],
      });

      const userAttributes = await lookupUserAttributes(
        "12345678-1234-1234-1234-123456789012",
        "us-east-1_ABC123",
      );
      expect(userAttributes).toEqual({
        sub: "12345678-1234-1234-1234-123456789012",
        "custom:state": "NY",
        username: "testuser",
      });
    });

    it("should throw an error if no user is found", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [],
      });

      await expect(
        lookupUserAttributes("12345678-1234-1234-1234-123456789012", "us-east-1_ABC123"),
      ).rejects.toThrow("No user found with this sub");
    });
  });

  describe("isAuthorized", () => {
    it("should return true for a CMS user", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [
          {
            Attributes: [{ Name: "custom:cms-roles", Value: "onemac-micro-reviewer" }],
          },
        ],
      });

      const result = await isAuthorized(event);
      expect(result).toBe(true);
    });

    it("should return true for a state user with matching stateCode", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [
          {
            Attributes: [
              {
                Name: "custom:cms-roles",
                Value: "onemac-micro-statesubmitter",
              },
              {
                Name: "custom:state",
                Value: "NY",
              },
            ],
          },
        ],
      });

      const result = await isAuthorized(event, "NY");
      expect(result).toBe(true);
    });

    it("should return false for a state user without matching stateCode", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [
          {
            Attributes: [
              {
                Name: "custom:cms-roles",
                Value: "onemac-micro-statesubmitter",
              },
              {
                Name: "custom:state",
                Value: "NY",
              },
            ],
          },
        ],
      });

      const result = await isAuthorized(event, "CA");
      expect(result).toBe(false);
    });
  });

  describe("isAuthorizedToGetPackageActions", () => {
    it("should return true for a CMS write user", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [
          {
            Attributes: [{ Name: "custom:cms-roles", Value: "onemac-micro-reviewer" }],
          },
        ],
      });

      const result = await isAuthorizedToGetPackageActions(event);
      expect(result).toBe(true);
    });

    it("should return true for a state user with matching stateCode", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [
          {
            Attributes: [
              {
                Name: "custom:cms-roles",
                Value: "onemac-micro-statesubmitter",
              },
              {
                Name: "custom:state",
                Value: "NY",
              },
            ],
          },
        ],
      });

      const result = await isAuthorizedToGetPackageActions(event, "NY");
      expect(result).toBe(true);
    });

    it("should return false for a state user without matching stateCode", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [
          {
            Attributes: [
              {
                Name: "custom:cms-roles",
                Value: "onemac-micro-statesubmitter",
              },
              {
                Name: "custom:state",
                Value: "NY",
              },
            ],
          },
        ],
      });

      const result = await isAuthorizedToGetPackageActions(event, "CA");
      expect(result).toBe(false);
    });
  });

  describe("getStateFilter", () => {
    it("should return state filter for a state user", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [
          {
            Attributes: [
              {
                Name: "custom:cms-roles",
                Value: "onemac-micro-statesubmitter",
              },
              { Name: "custom:state", Value: "NY,CA" },
            ],
          },
        ],
      });

      const result = await getStateFilter(event);
      expect(result).toEqual({
        terms: {
          state: ["ny", "ca"],
        },
      });
    });

    it("should throw an error if state user has no associated states", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [
          {
            Attributes: [
              {
                Name: "custom:cms-roles",
                Value: "onemac-micro-statesubmitter",
              },
              { Name: "custom:state", Value: "" },
            ],
          },
        ],
      });

      await expect(getStateFilter(event)).rejects.toThrow(
        "State user detected, but no associated states.  Cannot continue",
      );
    });

    it("should return null for a CMS user", async () => {
      mockSend.mockResolvedValueOnce({
        Users: [
          {
            Attributes: [{ Name: "custom:cms-roles", Value: "onemac-micro-reviewer" }],
          },
        ],
      });

      const result = await getStateFilter(event);
      expect(result).toBeNull();
    });
  });
});
