import { describe, it, expect, vi, beforeEach } from "vitest";
import * as utilities from "@/components/Inputs/upload.utilities";

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

    // Debug: log if fetch was called
    console.log("Mock fetch calls:", mockFetch.mock.calls);

    // Assertion
    expect(mockFetch).toHaveBeenCalledWith(url, {
      body: file,
      method: "PUT",
    });
  });
});
