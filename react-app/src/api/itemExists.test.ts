import { describe, it, expect, vi } from "vitest";
import { API } from "aws-amplify";
import { itemExists } from "./itemExists";

// Mock API.post
vi.mock("aws-amplify", () => ({
  API: {
    post: vi.fn(),
  },
}));


describe("Item Exists", () => {
  it("Should Return the value exists", async () => {
    const mockResponse = { exists: true };
    API.post = vi.fn().mockResolvedValue(mockResponse)

    const result = await itemExists('Test Id');
    expect(result).toBe(true);
  });
});
