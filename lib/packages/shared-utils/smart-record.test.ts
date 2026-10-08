import { SMART_RECORD_TYPE } from "shared-types";
import { describe, expect, it } from "vitest";

import { isHiddenSmartReservation } from "./smart-record";

describe("isHiddenSmartReservation", () => {
  it.each([
    [{ origin: "SMART" }, true],
    [{ origin: "SMART", smartRecordType: SMART_RECORD_TYPE.RESERVATION }, true],
    [{ origin: "SMART", smartRecordType: SMART_RECORD_TYPE.PACKAGE }, false],
    [{ origin: "OneMAC" }, false],
    [undefined, false],
  ])("classifies %j as hidden=%s", (record, expected) => {
    expect(isHiddenSmartReservation(record)).toBe(expected);
  });
});
