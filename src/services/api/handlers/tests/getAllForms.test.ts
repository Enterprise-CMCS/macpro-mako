import { describe, it, expect, vi } from "vitest";
import { getAllForms } from "../getAllForms";
import { response } from "../../libs/handler";

// Mock the dependencies
vi.mock("../../libs/handler", () => ({
  response: vi.fn((arg) => arg),
}));

vi.mock("../../webforms", () => ({
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
        ABP1: ["v202401", "v202402"],
        ABP3: ["v202401"],
      },
    };

    const result = await getAllForms();
    expect(result?.statusCode).toEqual(200);
    expect(result?.body).toEqual(expectedResponse.body);
    expect(response).toHaveBeenCalledWith(expectedResponse);
  });
});
