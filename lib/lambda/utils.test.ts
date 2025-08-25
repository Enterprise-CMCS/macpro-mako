import {
  OPENSEARCH_DOMAIN,
  OPENSEARCH_INDEX_NAMESPACE,
  REGION,
  SIMPLE_ID,
  WITHDRAW_RAI_ITEM_C,
} from "mocks";
import { Authority } from "shared-types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { calculate90dayExpiration, isChipSpaRespondRAIEvent } from "./utils";

describe("utils", () => {
  describe("isChipSpaRespondRAIEvent", () => {
    it("should return true for a CHIP SPA event with 'respond-to-rai'", () => {
      expect(
        isChipSpaRespondRAIEvent({
          id: SIMPLE_ID,
          event: "respond-to-rai",
          authority: Authority.CHIP_SPA as string,
        }),
      ).toBeTruthy();
    });

    it("should return false for a MED SPA event with 'respond-to-rai'", () => {
      expect(
        isChipSpaRespondRAIEvent({
          id: SIMPLE_ID,
          event: "respond-to-rai",
          authority: Authority.MED_SPA as string,
        }),
      ).toBeFalsy();
    });

    it("should return false for a CHIP SPA event with 'upload-subsequent-documents'", () => {
      expect(
        isChipSpaRespondRAIEvent({
          id: SIMPLE_ID,
          event: "upload-subsequent-documents",
          authority: Authority.CHIP_SPA as string,
        }),
      ).toBeFalsy();
    });
  });

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

    it("should calculate the 90 expiration date for a response-to-rai event", async () => {
      expect(await calculate90dayExpiration({ id: WITHDRAW_RAI_ITEM_C }, mockConfig)).toEqual();
    });
  });
});
