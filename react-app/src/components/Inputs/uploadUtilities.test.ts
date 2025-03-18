import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  extractBucketAndKeyFromUrl,
  getPresignedUrl,
  uploadToS3,
} from "@/components/Inputs/uploadUtilities";

describe("getPresignedUrl", () => {
  beforeEach(() => {
    vi.unmock("@/components/Inputs/uploadUtilities");
    vi.mock("aws-amplify", () => ({
      API: {
        post: vi.fn(async () => ({ url: "https://example.com/test-url" })),
      },
    }));
  });

  it("gets a presigned URL from the API", async () => {
    const fileName = "file.pdf";
    const url = await getPresignedUrl(fileName);
    expect(url).toBe("https://example.com/test-url");
  });
});

describe("uploadToS3", () => {
  beforeEach(() => {
    vi.unmock("@/components/Inputs/uploadUtilities");
  });

  it("uploads a file to S3", async () => {
    const file = new File(["file contents"], "file.pdf", { type: "application/pdf" });
    const url = "https://s3.us-east-1.amazonaws.com/hello/world";

    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    // Call the function
    await uploadToS3(file, url);

    // Assertion
    expect(mockFetch).toHaveBeenCalledWith(url, {
      body: file,
      method: "PUT",
    });
  });
  it("fails to upload a file to S3", async () => {
    const file = new File(["file contents"], "file.pdf", { type: "application/pdf" });
    const url = "https://s3.us-east-1.amazonaws.com/hello/world";

    const mockFetch = vi.fn().mockResolvedValue({ ok: false });
    global.fetch = mockFetch;

    await expect(() => uploadToS3(file, url)).rejects.toThrowError();
  });
  describe("extractBucketAndKeyFromUrl", () => {
    beforeEach(() => {
      vi.unmock("@/components/Inputs/uploadUtilities");
    });

    it("extracts the bucket and key from a URL", () => {
      const url = "https://hello.s3.us-east-1.amazonaws.com/world";
      const { bucket, key } = extractBucketAndKeyFromUrl(url);

      expect(bucket).toBe("hello");
      expect(key).toBe("world");
    });

    it("logs an error for an invalid URL", () => {
      const url = "invalid-url";
      const consoleSpy = vi.spyOn(console, "error");

      expect(() => extractBucketAndKeyFromUrl(url)).toThrowError("Invalid URL format:");

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Invalid URL format:", expect.any(Error));
    });
  });
});
