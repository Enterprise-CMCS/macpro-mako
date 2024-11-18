import { describe, it, expect, vi, beforeEach } from "vitest";
import * as utilities from "@/components/Inputs/upload.utilities";

describe("getPresignedUrl", () => {
  beforeEach(() => {
    vi.unmock("@/components/Inputs/upload.utilities");
    vi.mock("aws-amplify", () => ({
      API: {
        post: vi.fn(async () => ({ url: "https://example.com/test-url" })),
      },
    }));
  });

  it("gets a presigned URL from the API", async () => {
    const fileName = "file.pdf";
    const url = await utilities.getPresignedUrl(fileName);
    expect(url).toBe("https://example.com/test-url");
  });
});

describe("uploadToS3", () => {
  beforeEach(() => {
    vi.unmock("@/components/Inputs/upload.utilities");
  });

  it("uploads a file to S3", async () => {
    const file = new File(["file contents"], "file.pdf", { type: "application/pdf" });
    const url = "https://s3.us-east-1.amazonaws.com/hello/world";

    // Mock fetch
    const mockFetch = vi.fn().mockResolvedValue({});
    global.fetch = mockFetch;

    // Call the function
    await utilities.uploadToS3(file, url);

    // Assertion
    expect(mockFetch).toHaveBeenCalledWith(url, {
      body: file,
      method: "PUT",
    });
  });

  describe("extractBucketAndKeyFromUrl", () => {
    beforeEach(() => {
      vi.unmock("@/components/Inputs/upload.utilities");
    });

    it("extracts the bucket and key from a URL", () => {
      const url = "https://hello.s3.us-east-1.amazonaws.com/world";
      const { bucket, key } = utilities.extractBucketAndKeyFromUrl(url);

      expect(bucket).toBe("hello");
      expect(key).toBe("world");
    });

    it("logs an error for an invalid URL", () => {
      const url = "invalid-url";
      const consoleSpy = vi.spyOn(console, "error");

      const { bucket, key } = utilities.extractBucketAndKeyFromUrl(url);

      expect(bucket).toBeNull();
      expect(key).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Invalid URL format:", expect.any(Error));
    });
  });
});
