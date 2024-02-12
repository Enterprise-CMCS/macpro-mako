import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { seatoolSchema, opensearch } from "shared-types";
import typeEvent from "./data/SPA_Type-event.json";
import subTypeEvent from "./data/Type-event.json";
import {getTableName} from "./../handlers/sinkLookupData"

process.env.osDomain = "junkdomain"

describe("this test", () => {
  it("can read test event data", () => {
    expect(typeEvent).toBeTruthy()
    expect(subTypeEvent).toBeTruthy()
  })
})

describe("sinkLookupData", () => {
  it("can extract the table name from the event recordKey", () => {
    expect(getTableName("aws.seatool.cmcs.dbo.SPA_Type-0")).toEqual("SPA_Type")
    expect(getTableName("aws.seatool.cmcs.dbo.SPA_Type-1234")).toEqual("SPA_Type")
    expect(getTableName("--foo--bar--aws.seatool.cmcs.dbo.SPA_Type-0")).toEqual("SPA_Type")
    expect(getTableName("aws.seatool.cmcs.dbo.Type-0")).toEqual("Type")
    expect(getTableName("aws.seatool.cmcs.dbo.Type-1234")).toEqual("Type")
    expect(getTableName("--foo--bar--aws.seatool.cmcs.dbo.Type-0")).toEqual("Type")
  })
});
