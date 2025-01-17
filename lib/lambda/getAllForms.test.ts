import { describe, expect, it, vi } from "vitest";
import { getAllForms, mapWebformsKeys } from "./getAllForms";
import * as wfv from "libs/webforms";

vi.mock("../libs/webforms", () => ({
  webformVersions: {
    ABP1: {
      v202401: { name: "Test Form", data: "schema1" },
      v202402: { name: "Test Form", data: "schema2" },
    },
    ABP3: {
      v202401: { name: "Test Form", data: "schema3" },
    },
  },
}));
describe("getAllForms", () => {
  it("should return a response with status code 200 and the mapped webforms", async () => {
    const expectedResponse = {
      statusCode: 200,
      body: {
        ABP1: ["202401", "202402"],
        ABP3: ["202401"],
      },
    };

    const result = await getAllForms();
    expect(result?.statusCode).toEqual(200);
    expect(result?.body).toEqual(JSON.stringify(expectedResponse.body));
  });
  it("should return a response with status code 200 and the mapped webforms", async () => {
    const mockconstant = wfv as { webformVersions: object };
    mockconstant.webformVersions = {};

    const result = await getAllForms();
    expect(result?.statusCode).toEqual(502);
  });
});
