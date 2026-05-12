import {
  errorApiItemHandler,
  EXISTING_ITEM_APPROVED_AMEND_ID,
  EXISTING_ITEM_APPROVED_NEW_ID,
  EXISTING_ITEM_APPROVED_RENEW_ID,
  EXISTING_ITEM_PENDING_ID,
  NOT_FOUND_ITEM_ID,
  TEST_ITEM_ID,
} from "mocks";
import { mockedApiServer as mockedServer } from "mocks/server";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import * as gaModule from "@/utils/ReactGA/SendGAEvent";

import * as unit from "./useGetItem";
vi.mock("@/utils/ReactGA/SendGAEvent", () => ({
  sendGAEvent: vi.fn(),
}));
describe("getItem", () => {
  it("makes an AWS Amplify post request", async () => {
    const item = await unit.getItem(TEST_ITEM_ID);
    expect(item).toBeTruthy();
  });
});

describe("zod schema helpers", () => {
  describe("idIsApproved", () => {
    it("returns false for a blank id", async () => {
      expect(await unit.idIsApproved("")).toBe(false);
    });

    it("returns false if no getItem fails", async () => {
      expect(await unit.idIsApproved(NOT_FOUND_ITEM_ID)).toBe(false);
    });

    it("returns false if getItem errors", async () => {
      mockedServer.use(errorApiItemHandler);

      expect(await unit.idIsApproved(TEST_ITEM_ID)).toBe(false);
    });

    it("returns false if status is not approved", async () => {
      expect(await unit.idIsApproved(EXISTING_ITEM_PENDING_ID)).toBe(false);
    });

    it("returns true if status is approved", async () => {
      expect(await unit.idIsApproved(EXISTING_ITEM_APPROVED_NEW_ID)).toBe(true);
    });
  });

  describe("canBeRenewedOrAmended", () => {
    it("returns false for a blank id", async () => {
      expect(await unit.canBeRenewedOrAmended("")).toBe(false);
    });

    it("returns true if item is New or Renew actionType", async () => {
      const newCanRenewOrAmend = await unit.canBeRenewedOrAmended(EXISTING_ITEM_APPROVED_NEW_ID);
      const renewCanRenewOrAmend = await unit.canBeRenewedOrAmended(
        EXISTING_ITEM_APPROVED_RENEW_ID,
      );
      expect(newCanRenewOrAmend).toBe(true);
      expect(renewCanRenewOrAmend).toBe(true);
    });

    it("returns false if getItem errors", async () => {
      mockedServer.use(errorApiItemHandler);

      expect(await unit.canBeRenewedOrAmended(TEST_ITEM_ID)).toBe(false);
    });

    it("returns false if an item is Amend actionType", async () => {
      expect(await unit.canBeRenewedOrAmended(EXISTING_ITEM_APPROVED_AMEND_ID)).toBe(false);
    });
  });

  describe("getItem tests", () => {
    it("returns undefined when the API responds with a not-found payload", async () => {
      mockedServer.use(
        http.post("https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/item", () =>
          HttpResponse.json({ message: "No record found for the given id" }),
        ),
      );

      await expect(unit.getItem("TEST_ID")).resolves.toBeUndefined();
    });

    it("returns undefined when the API responds with a 404 not found error", async () => {
      mockedServer.use(
        http.post("https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/item", () =>
          HttpResponse.json({ message: "No record found for the given id" }, { status: 404 }),
        ),
      );

      await expect(unit.getItem("TEST_ID")).resolves.toBeUndefined();
    });

    it("returns undefined when the API throws a 404 status string", async () => {
      mockedServer.use(
        http.post("https://test-domain.execute-api.us-east-1.amazonaws.com/mocked-tests/item", () =>
          HttpResponse.json({ message: "Not Found" }, { status: 404 }),
        ),
      );

      await expect(unit.getItem("TEST_ID")).resolves.toBeUndefined();
    });

    it("should call sendGAEvent when the API throws an error", async () => {
      mockedServer.use(errorApiItemHandler);

      await expect(unit.getItem("TEST_ID")).rejects.toBeTruthy();

      expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
        "api_error",
        expect.objectContaining({
          message: "failure /item TEST_ID",
        }),
      );
    });

    it("returns undefined for draft-preferred lookups when the API throws an error", async () => {
      mockedServer.use(errorApiItemHandler);

      await expect(
        unit.getItem("TEST_ID", { includeDraft: true, preferDraft: true }),
      ).resolves.toBeUndefined();

      expect(gaModule.sendGAEvent).toHaveBeenCalledWith(
        "api_error",
        expect.objectContaining({
          message: "failure /item TEST_ID",
        }),
      );
    });
  });
});
