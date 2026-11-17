import { APIGatewayEvent } from "aws-lambda";
import {
  convertUserAttributes,
  getRequestContext,
  helpDeskUser,
  noRoleUser,
  nullStateSubmitter,
  setMockUsername,
  testReviewer,
  testStateSubmitter,
  USER_POOL_ID,
} from "mocks";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import * as userManagement from "../../../lambda/user-management/userManagementService";
import {
  getAuthDetails,
  getSearchUserScope,
  getStateFilter,
  isAuthorized,
  isAuthorizedToGetPackageActions,
  lookupUserAttributes,
} from "./user";

describe("Auth functions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(() => {
    setMockUsername(testStateSubmitter);
  });

  describe("getAuthDetails", () => {
    it("should return the correct auth details", () => {
      const authDetails = getAuthDetails({
        requestContext: getRequestContext(testStateSubmitter),
      } as APIGatewayEvent);
      expect(authDetails).toEqual({
        userId: testStateSubmitter.Username,
        poolId: USER_POOL_ID,
      });
    });

    it("should throw an error if no auth provider is present", () => {
      expect(() =>
        getAuthDetails({
          requestContext: {
            identity: {},
          },
        } as APIGatewayEvent),
      ).toThrow("No auth provider!");
    });
  });

  describe("lookupUserAttributes", () => {
    it("should return user attributes", async () => {
      const userAttributes = await lookupUserAttributes(
        testStateSubmitter.Username || "",
        USER_POOL_ID,
      );
      const expectedAttributes = convertUserAttributes(testStateSubmitter);
      expect(userAttributes).toEqual({
        ...expectedAttributes,
        role: undefined,
        states: undefined,
      });
    });

    it("should throw an error if no user is found", async () => {
      await expect(
        lookupUserAttributes("12345678-1234-1234-1234-123456789012", USER_POOL_ID),
      ).rejects.toThrow("No user found with this sub");
    });

    it("lowercases email values from Cognito attributes", async () => {
      const emailAttribute = testStateSubmitter.UserAttributes?.find(
        (attr) => attr.Name === "email",
      );
      const originalEmail = emailAttribute?.Value;

      if (!emailAttribute) {
        throw new Error("Test user is missing email attribute");
      }

      emailAttribute.Value = "StateSubmitter@Nightwatch.Test";

      try {
        const userAttributes = await lookupUserAttributes(
          testStateSubmitter.Username || "",
          USER_POOL_ID,
        );
        expect(userAttributes.email).toBe("statesubmitter@nightwatch.test");
      } finally {
        emailAttribute.Value = originalEmail;
      }
    });
  });

  describe("isAuthorized", () => {
    it("should return true for a CMS user", async () => {
      const result = await isAuthorized({
        requestContext: getRequestContext(testReviewer),
      } as APIGatewayEvent);
      expect(result).toBe(true);
    });

    it("should return true for a state user with matching stateCode", async () => {
      const result = await isAuthorized(
        {
          requestContext: getRequestContext(testStateSubmitter),
        } as APIGatewayEvent,
        "MD",
      );
      expect(result).toBe(true);
    });

    it("should return false for a state user without matching stateCode", async () => {
      const result = await isAuthorized(
        {
          requestContext: getRequestContext(testStateSubmitter),
        } as APIGatewayEvent,
        "CA",
      );
      expect(result).toBe(false);
    });
  });

  describe("isAuthorizedToGetPackageActions", () => {
    it("should return true for a CMS write user", async () => {
      const result = await isAuthorizedToGetPackageActions({
        requestContext: getRequestContext(testReviewer),
      } as APIGatewayEvent);
      expect(result).toBe(true);
    });

    it("should return true for a state user with matching stateCode", async () => {
      const result = await isAuthorizedToGetPackageActions(
        {
          requestContext: getRequestContext(testStateSubmitter),
        } as APIGatewayEvent,
        "MD",
      );
      expect(result).toBe(true);
    });

    it("should return false for a state user without matching stateCode", async () => {
      const result = await isAuthorizedToGetPackageActions(
        {
          requestContext: getRequestContext(testStateSubmitter),
        } as APIGatewayEvent,
        "CA",
      );
      expect(result).toBe(false);
    });
  });

  describe("getStateFilter", () => {
    it("should return state filter for a state user", async () => {
      const stateString =
        testStateSubmitter.UserAttributes?.find((attr) => attr?.Name == "custom:state")?.Value ||
        "";
      const states = stateString.split(",").map((state) => state.toLocaleLowerCase());

      const result = await getStateFilter({
        requestContext: getRequestContext(testStateSubmitter),
      } as APIGatewayEvent);
      expect(result).toEqual({
        terms: {
          state: states,
        },
      });
    });

    it("should deny access if a state user has no associated states", async () => {
      const result = await getStateFilter({
        requestContext: getRequestContext(nullStateSubmitter),
      } as APIGatewayEvent);
      expect(result).toBe(false);
    });

    it("should return null for a CMS user", async () => {
      const result = await getStateFilter({
        requestContext: getRequestContext(testReviewer),
      } as APIGatewayEvent);
      expect(result).toBeNull();
    });
  });

  describe("getSearchUserScope", () => {
    it("denies access when the active role does not grant CMS or state access", async () => {
      const attributes = convertUserAttributes(testStateSubmitter);
      const role = await userManagement.getLatestActiveRoleByEmail(attributes.email);
      expect(role).not.toBeNull();
      vi.spyOn(userManagement, "getLatestActiveRoleByEmail").mockResolvedValue({
        ...role!,
        role: "norole",
      });

      const result = await getSearchUserScope({
        requestContext: getRequestContext(testStateSubmitter),
      } as APIGatewayEvent);

      expect(result).toEqual({ stateFilter: false, canViewDrafts: false });
    });

    it("should deny draft visibility and search results when the user has no active role", async () => {
      const result = await getSearchUserScope({
        requestContext: getRequestContext(noRoleUser),
      } as APIGatewayEvent);

      expect(result).toEqual({
        stateFilter: false,
        canViewDrafts: false,
      });
    });

    it("should return state filter and deny draft visibility for state users", async () => {
      const stateString =
        testStateSubmitter.UserAttributes?.find((attr) => attr?.Name == "custom:state")?.Value ||
        "";
      const states = stateString.split(",").map((state) => state.toLocaleLowerCase());

      const result = await getSearchUserScope({
        requestContext: getRequestContext(testStateSubmitter),
      } as APIGatewayEvent);

      expect(result).toEqual({
        stateFilter: {
          terms: {
            state: states,
          },
        },
        canViewDrafts: false,
      });
    });

    it("should deny access if a state user has no associated states", async () => {
      const result = await getSearchUserScope({
        requestContext: getRequestContext(nullStateSubmitter),
      } as APIGatewayEvent);
      expect(result).toEqual({ stateFilter: false, canViewDrafts: false });
    });

    it("should deny draft visibility for CMS users who are not Helpdesk", async () => {
      const result = await getSearchUserScope({
        requestContext: getRequestContext(testReviewer),
      } as APIGatewayEvent);

      expect(result).toEqual({
        stateFilter: null,
        canViewDrafts: false,
      });
    });

    it("should allow Helpdesk users to view drafts without a state filter", async () => {
      const result = await getSearchUserScope({
        requestContext: getRequestContext(helpDeskUser),
      } as APIGatewayEvent);

      expect(result).toEqual({
        stateFilter: null,
        canViewDrafts: true,
      });
    });
  });
});
