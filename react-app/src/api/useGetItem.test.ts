import {
  EXISTING_ITEM_APPROVED_AMEND_ID,
  EXISTING_ITEM_APPROVED_NEW_ID,
  EXISTING_ITEM_APPROVED_RENEW_ID,
  EXISTING_ITEM_PENDING_ID,
  NOT_FOUND_ITEM_ID,
  TEST_ITEM_ID,
} from "mocks";
import { describe, expect, it } from "vitest";
import * as unit from "./useGetItem";

describe("getItem", () => {
  it("makes an AWS Amplify post request", async () => {
    const item = await unit.getItem(TEST_ITEM_ID);
    expect(item).toBeTruthy();
  });
});

describe("zod schema helpers", () => {
  describe("idIsApproved", () => {
    it("returns false if no getItem fails", async () => {
      expect(await unit.idIsApproved(NOT_FOUND_ITEM_ID)).toBe(false);
    });

    it("returns false if status is not approved", async () => {
      expect(await unit.idIsApproved(EXISTING_ITEM_PENDING_ID)).toBe(false);
    });

    it("returns true if status is approved", async () => {
      expect(await unit.idIsApproved(EXISTING_ITEM_APPROVED_NEW_ID)).toBe(true);
    });
  });

  describe("canBeRenewedOrAmended", () => {
    it("returns true if item is New or Renew actionType", async () => {
      const newCanRenewOrAmend = await unit.canBeRenewedOrAmended(EXISTING_ITEM_APPROVED_NEW_ID);
      const renewCanRenewOrAmend = await unit.canBeRenewedOrAmended(
        EXISTING_ITEM_APPROVED_RENEW_ID,
      );
      expect(newCanRenewOrAmend).toBe(true);
      expect(renewCanRenewOrAmend).toBe(true);
    });
    it("returns false if an item is Amend actionType", async () => {
      expect(await unit.canBeRenewedOrAmended(EXISTING_ITEM_APPROVED_AMEND_ID)).toBe(false);
    });
  });
});
