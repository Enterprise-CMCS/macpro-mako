import { UTCDate } from "@date-fns/utc";
import { WITHDRAW_RAI_ITEM_B, WITHDRAW_RAI_ITEM_C, WITHDRAW_RAI_ITEM_D } from "mocks";
import items from "mocks/data/items";
import { Authority } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { addPauseDurationToTimestamp } from "./utils";

describe("utils", () => {
  describe.only("addPauseDurationToTimestamp", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      const now = new Date(2024, 2, 1);
      vi.setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return the original timestamp if the event type is not respond-to-rai", async () => {
      const timestamp = Date.now();

      expect(
        await addPauseDurationToTimestamp(
          {
            id: WITHDRAW_RAI_ITEM_C,
            event: "new-chip-submission",
            authority: Authority.CHIP_SPA as string,
          },
          items[WITHDRAW_RAI_ITEM_C] as ItemResult,
          timestamp,
        ),
      ).toEqual(timestamp);
    });

    it("should return the original timestamp if the event type is respond-to-rai event but not a CHIP SPA", async () => {
      const timestamp = Date.now();

      expect(
        await addPauseDurationToTimestamp(
          {
            id: WITHDRAW_RAI_ITEM_C,
            event: "respond-to-rai",
            authority: Authority.MED_SPA as string,
          },
          items[WITHDRAW_RAI_ITEM_C] as ItemResult,
          timestamp,
        ),
      ).toEqual(timestamp);
    });

    it("should return the original timestamp if the raiRequestedDate is not set", async () => {
      const timestamp = Date.now();

      expect(
        await addPauseDurationToTimestamp(
          {
            id: WITHDRAW_RAI_ITEM_B,
            event: "respond-to-rai",
            authority: Authority.CHIP_SPA as string,
          },
          items[WITHDRAW_RAI_ITEM_B] as ItemResult,
          timestamp,
        ),
      ).toEqual(timestamp);
    });

    it("should return the original timestamp if the submissionDate is not set", async () => {
      const timestamp = Date.now();

      expect(
        await addPauseDurationToTimestamp(
          {
            id: WITHDRAW_RAI_ITEM_D,
            event: "respond-to-rai",
            authority: Authority.CHIP_SPA as string,
          },
          items[WITHDRAW_RAI_ITEM_D] as ItemResult,
          timestamp,
        ),
      ).toEqual(timestamp);
    });

    it("should add the pause duration to the timestamp for a respond-to-rai event", async () => {
      const timestamp = Date.now();
      expect(
        await addPauseDurationToTimestamp(
          {
            id: WITHDRAW_RAI_ITEM_C,
            event: "respond-to-rai",
            authority: Authority.CHIP_SPA as string,
          },
          items[WITHDRAW_RAI_ITEM_C] as ItemResult,
          timestamp,
        ),
      ).toEqual(new UTCDate(2024, 1, 29).getTime());
    });
  });
});
