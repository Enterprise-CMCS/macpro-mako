import { it, describe, expect } from "vitest";
import onemacRecords from "./test-onemac-legacy.json";
import { opensearch } from "..";

describe("onemac has valid data", () => {
  it("has valid data", () => {
    for (const record of onemacRecords) {
      // Note:  what do we do here?
      // In our sink, we filter our "-- --" records, as it indicates a non-onemac originating record.
      // But here we're parsing un filtered records, and our zod schema is rightly failing.
      // I added a filter here, to not fail the parse, but curious if theres a right way
      if (record.submitterName === "-- --") continue;
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
