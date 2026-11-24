import { getStatus, SEATOOL_STATUS } from "shared-types";
import { describe, expect, it } from "vitest";

import {
  CHIP_SMART_STATUS_VALUES,
  mapSmartStatus,
  mapSmartStatusToSeatoolStatus,
} from "./smartStatus";

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

describe("CHIP SMART status crosswalk", () => {
  it.each([
    ["Intake Needed", "Submitted", "Submitted - Intake Needed", false],
    ["Pending - First Clock", "Under Review", "Pending", false],
    ["Pending RAI", "RAI Issued", "Pending - RAI", false],
    ["Pending - Second Clock", "Under Review", "Pending", true],
    ["Pending Concurrence", "Under Review", "Pending - Concurrence", undefined],
    ["Pending - Concurrence", "Under Review", "Pending - Concurrence", undefined],
    ["Pending Approval", "Under Review", "Pending - Approval", undefined],
    ["Pending - Approval", "Under Review", "Pending - Approval", undefined],
    ["Pending Disapproval", "Under Review", "Pending - Disapproval", undefined],
    ["Pending - Disapproval", "Under Review", "Pending - Disapproval", undefined],
    ["Approved", "Approved", "Approved", false],
    ["Disapproved", "Disapproved", "Disapproved", false],
    ["Withdrawn", "Package Withdrawn", "Package Withdrawn", false],
  ])("maps %s for State and CMS users", (status, stateStatus, cmsStatus, secondClock) => {
    const mapping = mapSmartStatus(String(status), "CHIP SPA");
    expect(getStatus(mapping?.seatoolStatus)).toEqual({ stateStatus, cmsStatus });
    expect(mapping?.secondClock).toBe(secondClock);
  });

  it.each(["Unknown", "Pending Third Clock", "__proto__", "toString"])(
    "does not infer a status for %s",
    (status) => {
      expect(mapSmartStatus(status, "CHIP SPA")).toBeUndefined();
    },
  );

  it("keeps the additional CHIP spellings out of the Medicaid contract", () => {
    for (const status of CHIP_SMART_STATUS_VALUES.filter(
      (value) =>
        value === "Pending - Disapproval" ||
        value === "Pending - Approval" ||
        value === "Pending - Concurrence",
    )) {
      expect(mapSmartStatus(status, "Medicaid SPA")).toBeUndefined();
    }
  });
});
