import { it, describe, expect } from "vitest";
import onemacRecords from "./test-legacy-records.json";
import { opensearch } from "..";

describe("onemac has valid data", () => {
  it("has valid data", () => {
    for (const record of onemacRecords) {
      // Note:  This if should be a utility used by sinkMain and this test
      // The if should be tested independently
      if (record.sk !== "Package" || record.submitterName === "-- --") continue;
      const transformedData = opensearch.main.legacyPackageView
        .transform("randomid")
        .parse(record);
      expect(transformedData).toHaveProperty("id");
      expect(transformedData).toHaveProperty("submitterName");
      expect(transformedData).toHaveProperty("submitterEmail");
      expect(transformedData).toHaveProperty("origin");
    }
  });
});
