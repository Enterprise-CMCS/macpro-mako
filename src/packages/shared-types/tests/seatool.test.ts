import { describe, expect, it } from "vitest";
import seaToolRecords from "./test-seatool.json";
import { seatoolSchema } from "shared-types";
import * as main from "shared-types/opensearch/main";

describe("seatool has valid data", () => {
  it("can be validated against schema", () => {
    const parsedRecord = seatoolSchema.parse(seaToolRecords[0]);

    expect(parsedRecord.PLAN_TYPES?.[0].PLAN_TYPE_NAME).toBeDefined();
  });

  it("can be transformed into a new object", () => {
    for (const record of seaToolRecords) {
      const transformedRecord = main.transforms
        .seatool("randomid")
        .parse(record);

      expect(transformedRecord.id).toEqual("randomid");
      // expect(transformedRecord.planType).toEqual("Medicaid_SPA");
    }
  });
});
