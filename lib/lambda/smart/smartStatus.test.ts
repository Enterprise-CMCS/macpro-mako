import { SEATOOL_STATUS } from "shared-types";
import { describe, expect, it } from "vitest";

import { mapSmartStatusToSeatoolStatus } from "./smartStatus";

describe("mapSmartStatusToSeatoolStatus", () => {
  it.each([
    ["Intake Needed", SEATOOL_STATUS.SUBMITTED],
    ["Pkg Received", SEATOOL_STATUS.SUBMITTED],
    ["Package Received", SEATOOL_STATUS.SUBMITTED],
    ["Pending - First Clock", SEATOOL_STATUS.PENDING],
    ["Approved", SEATOOL_STATUS.APPROVED],
  ])("maps %s to %s", (smartStatus, seatoolStatus) => {
    expect(mapSmartStatusToSeatoolStatus(smartStatus)).toBe(seatoolStatus);
  });

  it("returns undefined for unknown SMART status strings", () => {
    expect(mapSmartStatusToSeatoolStatus("Withdrawn")).toBeUndefined();
  });
});
