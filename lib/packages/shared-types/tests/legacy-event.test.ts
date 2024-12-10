import { describe, expect, it } from "vitest";
import { Action, opensearch } from "..";
import onemacRecords from "./test-legacy-records.json";

describe("onemac has valid data", () => {
  it("has valid data", () => {
    for (const record of onemacRecords) {
      // Note:  This if should be a utility used by sinkChangelog and this test
      // The if should be tested independently
      if (
        !(
          record?.sk !== "Package" &&
          (record.GSI1pk?.startsWith("OneMAC#submit") || record.GSI1pk?.startsWith("OneMAC#enable"))
        )
      ) {
        continue;
      }
      const transformedData = opensearch.changelog.legacyEvent.transform("12345").parse(record);
      expect(transformedData).toHaveProperty("id");
      expect(transformedData).toHaveProperty("packageId");
      expect(transformedData).toHaveProperty("timestamp");
      expect(transformedData).toHaveProperty("actionType");
      expect(transformedData?.actionType).toBeTruthy();
      expect(
        [...Object.values(Action), "new-submission"].includes(transformedData?.actionType || ""),
      ).toBe(true);
    }
  });
});
