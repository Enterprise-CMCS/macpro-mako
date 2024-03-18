import { it, describe, expect } from "vitest";
import onemacRecords from "./test-legacy-records.json";
import { Action, opensearch } from "..";

describe("onemac has valid data", () => {
  it("has valid data", () => {
    for (const record of onemacRecords) {
      // Note:  This if should be a utility used by sinkChangelog and this test
      // The if should be tested independently
      if (
        !(
          record?.sk !== "Package" &&
          (record.GSI1pk?.startsWith("OneMAC#submit") ||
            record.GSI1pk?.startsWith("OneMAC#enable"))
        )
      ) {
        continue;
      }
      const transformedData = opensearch.changelog.legacyEvent
        .transform("randomid", 12345)
        .parse(record);
      expect(transformedData).toHaveProperty("id");
      expect(transformedData).toHaveProperty("packageId");
      expect(transformedData).toHaveProperty("timestamp");
      expect(transformedData).toHaveProperty("actionType");
      expect(
        Object.values(Action).includes(transformedData.actionType as Action),
      ).toBe(true);
    }
  });
});
