import { it, describe, expect } from "vitest";
import onemacRecords from "./test-onemac-legacy.json";
import { transformOnemacLegacy } from "../onemacLegacy";

describe("onemac has valid data", () => {
  it("has valid data", () => {
    for (const record of onemacRecords) {
      const transformedData = transformOnemacLegacy("randomid").parse(record);

      expect(transformedData).toHaveProperty(["attachments"]);
    }
  });
});
