import { it, describe, expect } from "vitest";
import onemacRecords from "./test-onemac-legacy.json";
import { opensearch } from "..";

describe("onemac has valid data", () => {
  it("has valid data", () => {
    for (const record of onemacRecords) {
      if (
        record.GSI1pk?.startsWith("OneMAC#submit") &&
        [
          "waivernew",
          "medicaidspa",
          "chipspa",
          "waiverappk",
          "waiveramendment",
          "waiverrenewal",
        ].includes(record.GSI1pk.split("OneMAC#submit")[1])
      ) {
        const transformedData = opensearch.main.legacySubmission
          .transform("randomid")
          .parse(record);
        expect(transformedData).toHaveProperty(["submitterName"]);
      }
    }
  });
});
