import { Request } from "@middy/core";
import {
  getFilteredRoleDocsByEmail,
  osUsers,
  TEST_ITEM_ID,
  TEST_STATE_SUBMITTER_EMAIL,
  TEST_STATE_SUBMITTER_USER,
} from "mocks";
import items from "mocks/data/items";
import { main, roles, users } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import { getPackage, getUser, MiddyUser, setPackage, setUser } from "./utils";

const TEST_ITEM = items[TEST_ITEM_ID] as main.ItemResult;
const TEST_USER: MiddyUser = {
  cognitoUser: TEST_STATE_SUBMITTER_USER,
  userDetails: osUsers[TEST_STATE_SUBMITTER_EMAIL]._source as users.Document,
  userProfile: (getFilteredRoleDocsByEmail(TEST_STATE_SUBMITTER_EMAIL) as roles.Document[]) || [],
};

describe("Middleware Utils", () => {
  describe("getPackage", () => {
    it("should get the package if it is stored internally", async () => {
      const request = {
        internal: { packageResult: TEST_ITEM },
        context: {},
      } as Request & { internal: { packageResult: main.ItemResult } };
      expect(await getPackage(request)).toEqual(TEST_ITEM);
    });

    it("should return undefined if the package is not stored internally", async () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      expect(await getPackage(request)).toBeUndefined();
    });
  });

  describe("setPackage", () => {
    it("should set the package only internally if the setToContext is not defined", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      setPackage(TEST_ITEM, request);
      expect(request).toEqual({
        internal: { packageResult: TEST_ITEM },
        context: {},
      });
    });

    it("should set the package only internally if the setToContext is false", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      setPackage(TEST_ITEM, request, false);
      expect(request).toEqual({
        internal: { packageResult: TEST_ITEM },
        context: {},
      });
    });

    it("should set the package internally and in the context if setToContext is true", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      setPackage(TEST_ITEM, request, true);
      expect(request).toEqual({
        internal: { packageResult: TEST_ITEM },
        context: { packageResult: TEST_ITEM },
      });
    });
  });

  describe("getUser", () => {
    it("should get the user if it is stored internally", async () => {
      const request = {
        internal: { user: TEST_USER },
        context: {},
      } as Request & { internal: { user: MiddyUser } };
      expect(await getUser(request)).toEqual(TEST_USER);
    });

    it("should return undefined if the user is not stored internally", async () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      expect(await getUser(request)).toBeUndefined();
    });
  });

  describe("setUser", () => {
    it("should set the package only internally if the setToContext is not defined", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      setUser(TEST_USER, request);
      expect(request).toEqual({
        internal: { user: TEST_USER },
        context: {},
      });
    });

    it("should set the package only internally if the setToContext is false", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      setUser(TEST_USER, request, false);
      expect(request).toEqual({
        internal: { user: TEST_USER },
        context: {},
      });
    });

    it("should set the package internally and in the context if setToContext is true", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      setUser(TEST_USER, request, true);
      expect(request).toEqual({
        internal: { user: TEST_USER },
        context: { user: TEST_USER },
      });
    });
  });
});
