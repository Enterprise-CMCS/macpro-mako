import { it, describe, expect } from "vitest";
import onemacRecords from "./test-onemac-legacy.json";
import { opensearch, transforms } from "..";

describe("onemac has valid data", () => {
  it("has valid data", () => {
    for (const record of onemacRecords) {
      const transformedData = transforms.legacySubmission
        .transform("randomid")
        .parse(record);

      expect(transformedData).toHaveProperty(["attachments"]);
    }
  });
});
