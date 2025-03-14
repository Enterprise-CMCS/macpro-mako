import { describe, expect, it } from "vitest";

import { formatActionTypeWithWaiver } from "./action-type";

describe("formatActionTypeWithWaiver", () => {
  it('should return "Initial Waiver" if "Initial" is provided as actionType', () => {
    const formattedWaiverAction = formatActionTypeWithWaiver("Initial");
    expect(formattedWaiverAction).toBe("Initial Waiver");
  });

  it('should return "Waiver Amendment" if "Amendment" is provided as actionType', () => {
    const formattedWaiverAction = formatActionTypeWithWaiver("Amendment");
    expect(formattedWaiverAction).toBe("Waiver Amendment");
  });

  it('should return "Waiver Renewal" if "Renewal" is provided as actionType', () => {
    const formattedWaiverAction = formatActionTypeWithWaiver("Renewal");
    expect(formattedWaiverAction).toBe("Waiver Renewal");
  });

  it('should return "Waiver" prepended to the input string if actionType is not part of the match cases', () => {
    const formattedWaiverAction = formatActionTypeWithWaiver("Unknown Action");
    expect(formattedWaiverAction).toBe("Waiver Unknown Action");
  });
});
