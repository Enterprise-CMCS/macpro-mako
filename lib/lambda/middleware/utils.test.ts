import { Request } from "@middy/core";
import { TEST_ITEM_ID, TEST_STATE_SUBMITTER_USER } from "mocks";
import items from "mocks/data/items";
import { FullUser } from "shared-types";
import { main } from "shared-types/opensearch";
import { describe, expect, it } from "vitest";

import {
  getAuthUserFromRequest,
  getPackageFromRequest,
  storeAuthUserInRequest,
  storePackageInRequest,
} from "./utils";

const TEST_ITEM = items[TEST_ITEM_ID] as main.ItemResult;
const TEST_USER: FullUser = {
  ...TEST_STATE_SUBMITTER_USER,
  role: "statesubmitter",
  states: ["VA", "OH", "SC", "CO", "GA", "MD"],
};

describe("Middleware Utils", () => {
  describe("getPackageFromRequest", () => {
    it("should get the package if it is stored internally", async () => {
      const request = {
        internal: { packageResult: TEST_ITEM },
        context: {},
      } as Request & { internal: { packageResult: main.ItemResult } };
      expect(await getPackageFromRequest(request)).toEqual(TEST_ITEM);
    });

    it("should return undefined if the package is not stored internally", async () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      expect(await getPackageFromRequest(request)).toBeUndefined();
    });
  });

  describe("storePackageInRequest", () => {
    it("should set the package only internally if the setToContext is not defined", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      storePackageInRequest(TEST_ITEM, request);
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
      storePackageInRequest(TEST_ITEM, request, false);
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
      storePackageInRequest(TEST_ITEM, request, true);
      expect(request).toEqual({
        internal: { packageResult: TEST_ITEM },
        context: { packageResult: TEST_ITEM },
      });
    });
  });

  describe("getAuthUserFromRequest", () => {
    it("should get the user if it is stored internally", async () => {
      const request = {
        internal: { currUser: TEST_USER },
        context: {},
      } as Request & { internal: { currUser: FullUser } };
      expect(await getAuthUserFromRequest(request)).toEqual(TEST_USER);
    });

    it("should return undefined if the user is not stored internally", async () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      expect(await getAuthUserFromRequest(request)).toBeUndefined();
    });
  });

  describe("storeAuthUserInRequest", () => {
    it("should set the package only internally if the setToContext is not defined", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      storeAuthUserInRequest(TEST_USER, request);
      expect(request).toEqual({
        internal: { currUser: TEST_USER },
        context: {},
      });
    });

    it("should set the package only internally if the setToContext is false", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      storeAuthUserInRequest(TEST_USER, request, false);
      expect(request).toEqual({
        internal: { currUser: TEST_USER },
        context: {},
      });
    });

    it("should set the package internally and in the context if setToContext is true", () => {
      const request = {
        internal: {},
        context: {},
      } as Request;
      storeAuthUserInRequest(TEST_USER, request, true);
      expect(request).toEqual({
        internal: { currUser: TEST_USER },
        context: { currUser: TEST_USER },
      });
    });
  });
});
