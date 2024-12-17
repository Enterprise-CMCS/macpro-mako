import { describe, it, expect, vi } from "vitest";
import { API } from "aws-amplify";
import { getAttachmentUrl } from "./getAttachmentUrl"; // Adjust the import path if needed

// Mock API.post
vi.mock("aws-amplify", () => ({
  API: {
    post: vi.fn(),
  },
}));

describe("getAttachmentUrl", () => {
  it("should return the URL from the response", async () => {
    const mockUrl = "https://aws.attachment.com";
    const mockResponse = { url: mockUrl };
    API.post = vi.fn().mockResolvedValue(mockResponse);
    const result = await getAttachmentUrl("123", "bucket", "key", "name");

    expect(result).toBe(mockUrl);
  });
});
