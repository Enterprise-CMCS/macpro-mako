import { describe, it, expect, vi } from "vitest";
import { convertStateAbbrToFullName } from "./stateNames"; // Adjust the path as needed

// Correct usage of `vi.mock` with a factory function to mock `STATES`
vi.mock("@/hooks", () => ({
  STATES: {
    CA: "California, CA",
    NY: "New York, NY",
    TX: "Texas, TX",
    FL: "Florida, FL",
  },
}));

describe("convertStateAbbrToFullName", () => {
  it("should return the full state name for a valid abbreviation", () => {
    expect(convertStateAbbrToFullName("CA")).toBe("California");
    expect(convertStateAbbrToFullName("NY")).toBe("New York");
    expect(convertStateAbbrToFullName("TX")).toBe("Texas");
    expect(convertStateAbbrToFullName("FL")).toBe("Florida");
  });

  it("should return the input string for an invalid abbreviation", () => {
    expect(convertStateAbbrToFullName("ZZ")).toBe("ZZ");
    expect(convertStateAbbrToFullName("Unknown")).toBe("Unknown");
    expect(convertStateAbbrToFullName("CAL")).toBe("CAL");
  });

  it("should handle empty input gracefully", () => {
    expect(convertStateAbbrToFullName("")).toBe("");
  });
});
