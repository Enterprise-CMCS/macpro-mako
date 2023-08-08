import { it, describe, expect } from "vitest";
import onemacRecords from "./test-onemac.json";
import { transformOnemac } from "../onemac";

describe("onemac has valid data", () => {
  it("has valid data", () => {
    for (const record of onemacRecords) {
      const transformedData = transformOnemac("randomid").parse(record);

      expect(transformedData).toMatchObject({});
    }
  });
});
