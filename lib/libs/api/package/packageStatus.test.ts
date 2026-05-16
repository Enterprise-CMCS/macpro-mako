import { SEATOOL_STATUS } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";
import { describe, expect, it } from "vitest";

import {
  isActiveDraftPackage,
  isActiveMainNonDraftPackage,
  isDeletedDraftPackage,
} from "./packageStatus";

const packageResult = (source: Record<string, unknown>, found = true) =>
  ({
    found,
    _source: {
      id: "MD-25-2525-SAVE",
      ...source,
    },
  }) as ItemResult;

describe("packageStatus", () => {
  describe("isActiveMainNonDraftPackage", () => {
    it("returns true for found non-deleted packages with a non-draft SeaTool status", () => {
      expect(
        isActiveMainNonDraftPackage(packageResult({ seatoolStatus: SEATOOL_STATUS.SUBMITTED })),
      ).toBe(true);
    });

    it("returns false for missing, deleted, draft, and malformed shell packages", () => {
      expect(isActiveMainNonDraftPackage(undefined)).toBe(false);
      expect(
        isActiveMainNonDraftPackage(
          packageResult({ seatoolStatus: SEATOOL_STATUS.SUBMITTED }, false),
        ),
      ).toBe(false);
      expect(
        isActiveMainNonDraftPackage(
          packageResult({ deleted: true, seatoolStatus: SEATOOL_STATUS.SUBMITTED }),
        ),
      ).toBe(false);
      expect(
        isActiveMainNonDraftPackage(packageResult({ seatoolStatus: SEATOOL_STATUS.DRAFT })),
      ).toBe(false);
      expect(
        isActiveMainNonDraftPackage(packageResult({ changedDate: "2026-04-27T19:56:38Z" })),
      ).toBe(false);
      expect(isActiveMainNonDraftPackage(packageResult({ seatoolStatus: "   " }))).toBe(false);
    });
  });

  describe("isActiveDraftPackage", () => {
    it("returns true only for found non-deleted draft packages", () => {
      expect(isActiveDraftPackage(packageResult({ seatoolStatus: SEATOOL_STATUS.DRAFT }))).toBe(
        true,
      );
      expect(isActiveDraftPackage(undefined)).toBe(false);
      expect(
        isActiveDraftPackage(packageResult({ seatoolStatus: SEATOOL_STATUS.DRAFT }, false)),
      ).toBe(false);
      expect(
        isActiveDraftPackage(packageResult({ deleted: true, seatoolStatus: SEATOOL_STATUS.DRAFT })),
      ).toBe(false);
      expect(isActiveDraftPackage(packageResult({ seatoolStatus: SEATOOL_STATUS.SUBMITTED }))).toBe(
        false,
      );
    });
  });

  describe("isDeletedDraftPackage", () => {
    it("returns true only for found deleted draft packages", () => {
      expect(
        isDeletedDraftPackage(
          packageResult({ deleted: true, seatoolStatus: SEATOOL_STATUS.DRAFT }),
        ),
      ).toBe(true);
      expect(isDeletedDraftPackage(undefined)).toBe(false);
      expect(
        isDeletedDraftPackage(
          packageResult({ deleted: true, seatoolStatus: SEATOOL_STATUS.DRAFT }, false),
        ),
      ).toBe(false);
      expect(isDeletedDraftPackage(packageResult({ seatoolStatus: SEATOOL_STATUS.DRAFT }))).toBe(
        false,
      );
      expect(
        isDeletedDraftPackage(
          packageResult({ deleted: true, seatoolStatus: SEATOOL_STATUS.SUBMITTED }),
        ),
      ).toBe(false);
    });
  });
});
