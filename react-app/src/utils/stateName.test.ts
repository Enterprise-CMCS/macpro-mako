import { describe, it, expect } from "vitest";
import { convertStateAbbrToFullName } from "./stateNames"; 

describe("convertStateAbbrToFullName", () => {
  it("should return the full state name for a valid abbreviation", () => {
    expect(convertStateAbbrToFullName("CA")).toBe("California");
    expect(convertStateAbbrToFullName("NY")).toBe("New York");
    expect(convertStateAbbrToFullName("TX")).toBe("Texas");
    expect(convertStateAbbrToFullName("FL")).toBe("Florida");
  });

  it("should return the input string for an invalid abbreviation", () => {
    expect(convertStateAbbrToFullName("CAL")).toBe("CAL");
  });

  it("should handle empty input gracefully", () => {
    expect(convertStateAbbrToFullName("")).toBe("");
  });
});
