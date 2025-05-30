import { APIGatewayEvent } from "aws-lambda";
import {
  convertUserAttributes,
  getRequestContext,
  makoReviewer,
  makoStateSubmitter,
  nullStateSubmitter,
  setMockUsername,
  USER_POOL_ID,
} from "mocks";
import { afterAll, describe, expect, it } from "vitest";

import {
  getAuthDetails,
  getStateFilter,
  isAuthorized,
  isAuthorizedToGetPackageActions,
  lookupUserAttributes,
} from "./user";

describe("Auth functions", () => {
  afterAll(() => {
    setMockUsername(makoStateSubmitter);
  });

  describe("getAuthDetails", () => {
    it("should return the correct auth details", () => {
      const authDetails = getAuthDetails({
        requestContext: getRequestContext(makoStateSubmitter),
      } as APIGatewayEvent);
      expect(authDetails).toEqual({
        userId: makoStateSubmitter.Username,
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
        makoStateSubmitter.Username || "",
        USER_POOL_ID,
      );
      const expectedAttributes = convertUserAttributes(makoStateSubmitter);
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
  });

  describe("isAuthorized", () => {
    it("should return true for a CMS user", async () => {
      const result = await isAuthorized({
        requestContext: getRequestContext(makoReviewer),
      } as APIGatewayEvent);
      expect(result).toBe(true);
    });

    it("should return true for a state user with matching stateCode", async () => {
      const result = await isAuthorized(
        {
          requestContext: getRequestContext(makoStateSubmitter),
        } as APIGatewayEvent,
        "MD",
      );
      expect(result).toBe(true);
    });

    it("should return false for a state user without matching stateCode", async () => {
      const result = await isAuthorized(
        {
          requestContext: getRequestContext(makoStateSubmitter),
        } as APIGatewayEvent,
        "CA",
      );
      expect(result).toBe(false);
    });
  });

  describe("isAuthorizedToGetPackageActions", () => {
    it("should return true for a CMS write user", async () => {
      const result = await isAuthorizedToGetPackageActions({
        requestContext: getRequestContext(makoReviewer),
      } as APIGatewayEvent);
      expect(result).toBe(true);
    });

    it("should return true for a state user with matching stateCode", async () => {
      const result = await isAuthorizedToGetPackageActions(
        {
          requestContext: getRequestContext(makoStateSubmitter),
        } as APIGatewayEvent,
        "MD",
      );
      expect(result).toBe(true);
    });

    it("should return false for a state user without matching stateCode", async () => {
      const result = await isAuthorizedToGetPackageActions(
        {
          requestContext: getRequestContext(makoStateSubmitter),
        } as APIGatewayEvent,
        "CA",
      );
      expect(result).toBe(false);
    });
  });

  describe("getStateFilter", () => {
    it("should return state filter for a state user", async () => {
      const stateString =
        makoStateSubmitter.UserAttributes?.find((attr) => attr?.Name == "custom:state")?.Value ||
        "";
      const states = stateString.split(",").map((state) => state.toLocaleLowerCase());

      const result = await getStateFilter({
        requestContext: getRequestContext(makoStateSubmitter),
      } as APIGatewayEvent);
      expect(result).toEqual({
        terms: {
          state: states,
        },
      });
    });

    it("should throw an error if state user has no associated states", async () => {
      await expect(
        getStateFilter({
          requestContext: getRequestContext(nullStateSubmitter),
        } as APIGatewayEvent),
      ).rejects.toThrow("State user detected, but no associated states.  Cannot continue");
    });

    it("should return null for a CMS user", async () => {
      const result = await getStateFilter({
        requestContext: getRequestContext(makoReviewer),
      } as APIGatewayEvent);
      expect(result).toBeNull();
    });
  });
});
