import { describe, expect, it } from "vitest";
import seaToolRecords from "./test-seatool.json";
import { seatoolSchema, opensearch } from "shared-types";

describe("seatool has valid data", () => {
  it("can be validated against schema", () => {
    const parsedRecord = seatoolSchema.parse(seaToolRecords[0]);

    expect(parsedRecord.PLAN_TYPES?.[0].PLAN_TYPE_NAME).toBeDefined();
  });

  it("can be transformed into a new object", () => {
    for (const record of seaToolRecords) {
      const transformedRecord = opensearch.main.seatool
        .transform("randomid")
        .parse(record);
      expect(transformedRecord.id).toEqual("randomid");
    }
  });
});
