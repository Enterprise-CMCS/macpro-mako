import { it, describe, expect } from "vitest";
import onemacRecords from "./test-onemac-legacy.json";
import * as main from "../opensearch/main";

describe("onemac has valid data", () => {
  it("has valid data", () => {
    for (const record of onemacRecords) {
      const transformedData = main.transforms
        .legacySubmission("randomid")
        .parse(record);

      expect(transformedData).toHaveProperty(["attachments"]);
    }
  });
});
