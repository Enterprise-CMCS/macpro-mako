import { SEATOOL_STATUS } from "shared-types";
import { ItemResult } from "shared-types/opensearch/main";
import { describe, expect, it } from "vitest";

import {
  isActiveDraftPackage,
  isActiveMainNonDraftPackage,
  isDeletedDraftPackage,
} from "./packageStatus";

const packageResult = (source?: Record<string, unknown>, found = true): ItemResult =>
  ({
    found,
    _id: "MD-25-2525-SAVE",
    _source: source,
  }) as ItemResult;

describe("packageStatus predicates", () => {
  it("treats found non-draft packages as active main packages", () => {
    const result = packageResult({
      id: "MD-25-2525-SAVE",
      seatoolStatus: SEATOOL_STATUS.PENDING,
      deleted: false,
    });

    expect(isActiveMainNonDraftPackage(result)).toBe(true);
    expect(isActiveDraftPackage(result)).toBe(false);
    expect(isDeletedDraftPackage(result)).toBe(false);
  });

  it("does not treat draft packages as active main packages", () => {
    const result = packageResult({
      id: "MD-25-2525-SAVE",
      seatoolStatus: SEATOOL_STATUS.DRAFT,
      deleted: false,
    });

    expect(isActiveMainNonDraftPackage(result)).toBe(false);
    expect(isActiveDraftPackage(result)).toBe(true);
    expect(isDeletedDraftPackage(result)).toBe(false);
  });

  it("identifies deleted draft packages separately from active drafts", () => {
    const result = packageResult({
      id: "MD-25-2525-SAVE",
      seatoolStatus: SEATOOL_STATUS.DRAFT,
      deleted: true,
    });

    expect(isActiveMainNonDraftPackage(result)).toBe(false);
    expect(isActiveDraftPackage(result)).toBe(false);
    expect(isDeletedDraftPackage(result)).toBe(true);
  });

  it("ignores shell docs without a known seatool status", () => {
    const result = packageResult({
      id: "MD-25-2525-SAVE",
      changedDate: "2026-04-27T19:56:38.000Z",
    });

    expect(isActiveMainNonDraftPackage(result)).toBe(false);
    expect(isActiveDraftPackage(result)).toBe(false);
    expect(isDeletedDraftPackage(result)).toBe(false);
  });

  it("returns false for missing or unfound packages", () => {
    const notFound = packageResult(undefined, false);

    expect(isActiveMainNonDraftPackage()).toBe(false);
    expect(isActiveDraftPackage()).toBe(false);
    expect(isDeletedDraftPackage()).toBe(false);
    expect(isActiveMainNonDraftPackage(notFound)).toBe(false);
    expect(isActiveDraftPackage(notFound)).toBe(false);
    expect(isDeletedDraftPackage(notFound)).toBe(false);
  });
});
