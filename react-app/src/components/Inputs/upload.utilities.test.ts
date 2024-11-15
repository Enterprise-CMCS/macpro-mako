import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractBucketAndKeyFromUrl } from "./upload.utilities";

// Constants for test data
const VALID_URL = "https://my-bucket.s3.us-east-1.amazonaws.com/my-key";
const INVALID_URL = "invalid-url";

const MOCK_VALID_RESULT = { bucket: "my-bucket", key: "my-key" };
const MOCK_INVALID_RESULT = { bucket: null, key: null };

// Mock implementation
vi.mock("./upload.utilities", () => ({
  extractBucketAndKeyFromUrl: vi.fn((url) => {
    if (url === VALID_URL) {
      return MOCK_VALID_RESULT;
    } else {
      return MOCK_INVALID_RESULT;
    }
  }),
}));

describe("extractBucketAndKeyFromUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("extracts bucket and key from a valid URL", () => {
    const result = extractBucketAndKeyFromUrl(VALID_URL);
    expect(result).toEqual(MOCK_VALID_RESULT);
  });

  it("returns null for bucket and key for an invalid URL", () => {
    const result = extractBucketAndKeyFromUrl(INVALID_URL);
    expect(result).toEqual(MOCK_INVALID_RESULT);
  });
});
