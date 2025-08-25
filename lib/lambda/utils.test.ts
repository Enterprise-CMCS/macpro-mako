import { UTCDate } from "@date-fns/utc";
import {
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  REGION,
  WITHDRAW_RAI_ITEM_B,
  WITHDRAW_RAI_ITEM_C,
  WITHDRAW_RAI_ITEM_D,
} from "mocks";
import { Authority } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { calculate90dayExpiration } from "./utils";

describe("utils", () => {
  describe.only("calculate90dayExpiration", () => {
    const mockConfig = {
      osDomain: OPENSEARCH_DOMAIN,
      indexNamespace: OPENSEARCH_INDEX_NAMESPACE,
      region: REGION,
    } as any;

    beforeEach(() => {
      vi.useFakeTimers();
      const now = new Date(2024, 2, 1);
      vi.setSystemTime(now);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return undefined if the event type is not respond-to-rai", async () => {
      expect(
        await calculate90dayExpiration(
          {
            id: WITHDRAW_RAI_ITEM_C,
            event: "new-chip-submission",
            authority: Authority.CHIP_SPA as string,
          },
          mockConfig,
        ),
      ).toBeUndefined();
    });

    it("should return undefined if the event type is respond-to-rai event but not a CHIP SPA", async () => {
      expect(
        await calculate90dayExpiration(
          {
            id: WITHDRAW_RAI_ITEM_C,
            event: "respond-to-rai",
            authority: Authority.MED_SPA as string,
          },
          mockConfig,
        ),
      ).toBeUndefined();
    });

    it("should return undefined if the raiRequestedDate is not set", async () => {
      expect(
        await calculate90dayExpiration(
          {
            id: WITHDRAW_RAI_ITEM_B,
            event: "respond-to-rai",
            authority: Authority.CHIP_SPA as string,
          },
          mockConfig,
        ),
      ).toBeUndefined();
    });

    it("should return undefined if the submissionDate is not set", async () => {
      expect(
        await calculate90dayExpiration(
          {
            id: WITHDRAW_RAI_ITEM_D,
            event: "respond-to-rai",
            authority: Authority.CHIP_SPA as string,
          },
          mockConfig,
        ),
      ).toBeUndefined();
    });

    it("should calculate the 90 expiration date for a respond-to-rai event", async () => {
      expect(
        await calculate90dayExpiration(
          {
            id: WITHDRAW_RAI_ITEM_C,
            event: "respond-to-rai",
            authority: Authority.CHIP_SPA as string,
          },
          mockConfig,
        ),
      ).toEqual(new UTCDate(2024, 4, 29).getTime());
    });
  });
});
