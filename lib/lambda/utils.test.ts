import { SIMPLE_ID } from "mocks";
import { Authority } from "shared-types";
import { describe, expect, it } from "vitest";

import { isChipSpaRespondRAIEvent } from "./utils";

describe("utils", () => {
  describe("isChipSpaRespondRAIEvent", () => {
    it("should return true for a event with 'respond-to-rai'", () => {
      expect(
        isChipSpaRespondRAIEvent({
          id: SIMPLE_ID,
          event: "respond-to-rai",
          authority: Authority.CHIP_SPA as string,
        }),
      ).toBeTruthy();
    });
  });
  // describe("calculate90dayExpiration", () => {});
});
