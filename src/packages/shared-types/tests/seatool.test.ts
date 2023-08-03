import { describe, expect, it } from "vitest";
import seaToolRecord from "./seatool_event.json";
import { decode } from "base-64";
import { seatoolSchema, transformSeatoolData } from "../seatool";

describe("seatool has valid data", () => {
  it("can be decoded", () => {
    const record = decode(
      seaToolRecord.records["aws.ksqldb.seatool.agg.State_Plan-0"][0].value
    );

    console.log(record);

    expect(record).not.toBeUndefined();

    const parsedObject = JSON.parse(record);

    expect(parsedObject).toBeTypeOf("object");
  });

  it("can be validated against schema", () => {
    const record = JSON.parse(
      decode(
        seaToolRecord.records["aws.ksqldb.seatool.agg.State_Plan-0"][0].value
      )
    );

    const parsedRecord = seatoolSchema.parse(record);

    expect(parsedRecord.PLAN_TYPES[0].PLAN_TYPE_NAME).toBeDefined();
  });

  it("can be transformed into a new object", () => {
    const record = JSON.parse(
      decode(
        seaToolRecord.records["aws.ksqldb.seatool.agg.State_Plan-0"][0].value
      )
    );

    const transformedRecord = transformSeatoolData("randomid").parse(record);

    console.log(transformedRecord);

    expect(transformedRecord.id).toEqual("randomid");
    expect(transformedRecord.planType).toEqual("Medicaid_SPA");
  });
});
