import { SEATOOL_STATUS } from "shared-types";
import { describe, expect, it } from "vitest";

import { mapSmartStatusToSeatoolStatus } from "./smartStatus";

describe("mapSmartStatusToSeatoolStatus", () => {
  it.each([
    ["Intake Needed", SEATOOL_STATUS.SUBMITTED],
    ["Pending - First Clock", SEATOOL_STATUS.PENDING],
    ["Pending RAI", SEATOOL_STATUS.PENDING_RAI],
    ["Pending - Second Clock", SEATOOL_STATUS.PENDING],
    ["Pending Concurrence", SEATOOL_STATUS.PENDING_CONCURRENCE],
    ["Pending Approval", SEATOOL_STATUS.PENDING_APPROVAL],
    ["Pending Disapproval", SEATOOL_STATUS.PENDING_DISAPPROVAL],
    ["Approved", SEATOOL_STATUS.APPROVED],
    ["Disapproved", SEATOOL_STATUS.DISAPPROVED],
    ["Withdrawn", SEATOOL_STATUS.WITHDRAWN],
  ])("maps %s to %s", (smartStatus, seatoolStatus) => {
    expect(mapSmartStatusToSeatoolStatus(smartStatus)).toBe(seatoolStatus);
  });

  it.each(["Unknown status", "Pkg Received", "Package Received"])(
    "returns undefined for unsupported SMART status %s",
    (smartStatus) => {
      expect(mapSmartStatusToSeatoolStatus(smartStatus)).toBeUndefined();
    },
  );
});
