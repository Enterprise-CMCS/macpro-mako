import { describe, expect, it } from "vitest";
import seaToolRecords from "./test-seatool.json";
import { seatoolSchema, opensearch } from "shared-types";

describe("seatool has valid data", () => {
  it("can be validated against schema", () => {
    const parsedRecord = seatoolSchema.parse({
      ...seaToolRecords[0],
      CHANGED_DATE: 1708695001,
    });
    expect(parsedRecord.STATE_PLAN.PLAN_TYPE).toBeDefined();
  });

  it("can be transformed into a new object", () => {
    for (const record of seaToolRecords) {
      const rec = { ...record, CHANGED_DATE: 1708695001 };
      const transformedRecord = opensearch.main.seatool
        .transform("randomid")
        .parse(rec);
      expect(transformedRecord.id).toEqual("randomid");
    }
  });
});
