import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { useAttachmentService } from "./hook";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getAttachmentUrl } from "@/api";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}> {children}</QueryClientProvider>
);

vi.mock("@/api", async (importOriginals) => ({
  ...(await importOriginals()),
  getAttachmentUrl: vi.fn(),
}));

vi.mock("file-saver", async (importOriginals) => ({
  ...(await importOriginals()),
  saveAs: vi.fn(),
}));

global.fetch = vi.fn();

describe("useAttachmentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onUrl getAttachmentUrl with correct parameters", async () => {
    const packageId = "testPackage";
    const attachment = {
      title: "Test Bucket",
      bucket: "testBucket",
      key: "testKey",
      filename: "testFile",
      uploadDate: 123232,
    };

    const mockedGetAttachmentUrl = getAttachmentUrl as Mock;
    mockedGetAttachmentUrl.mockResolvedValue("http://example.com/testFile");

    const { result } = renderHook(() => useAttachmentService({ packageId }), {
      wrapper,
    });

    const url = await result.current.onUrl(attachment);

    expect(mockedGetAttachmentUrl).toHaveBeenCalledWith(
      packageId,
      attachment.bucket,
      attachment.key,
      attachment.filename,
    );

    expect(url).toBe("http://example.com/testFile");
  });

  it("calls onZip and generates a ZIP and downloads it with correct filenames", async () => {
    const packageId = "testPackage";
    const attachments = [
      {
        title: "Test Bucket",
        bucket: "bucket1",
        key: "key1",
        filename: "file1.md",
        uploadDate: 123231,
      },
      {
        title: "Test Bucket",
        bucket: "bucket2",
        key: "key2",
        filename: "file2.md",
        uploadDate: 123232,
      },
    ];

    const mockedGetAttachmentUrl = getAttachmentUrl as Mock<typeof getAttachmentUrl>;
    mockedGetAttachmentUrl.mockResolvedValueOnce("http://example.com/file1.md");
    mockedGetAttachmentUrl.mockResolvedValueOnce("http://example.com/file2.md");

    const fetchSpy = vi
      .spyOn(global, "fetch")
      // @ts-expect-error
      .mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["file1"])),
      })
      // @ts-expect-error
      .mockResolvedValueOnce({
        blob: vi.fn().mockResolvedValue(new Blob(["file2"])),
      });

    const zipFileSpy = vi.spyOn(JSZip.prototype, "file");
    vi.spyOn(JSZip.prototype, "generateAsync").mockResolvedValue(new Blob());

    const { result } = renderHook(() => useAttachmentService({ packageId }), { wrapper });

    await waitFor(() => {
      result.current.onZip(attachments);
    });

    expect(mockedGetAttachmentUrl).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toBeCalledTimes(2);
    expect(zipFileSpy).toBeCalledWith("file1(1).md", expect.any(Blob));
    expect(zipFileSpy).toBeCalledWith("file2().md", expect.any(Blob));
    expect(saveAs).toBeCalledWith(expect.any(Blob), expect.any(String));
  });

  it("calls onZip and logs errors if fetch or zip generation fails", async () => {
    const packageId = "testPackage";
    const attachments = [
      {
        title: "Test Bucket",
        bucket: "bucket1",
        key: "key1",
        filename: "file1.md",
        uploadDate: 123232,
      },
    ];

    const mockedGetAttachmentUrl = getAttachmentUrl as Mock<typeof getAttachmentUrl>;
    const getAttachmentUrlSpy = mockedGetAttachmentUrl.mockResolvedValue(
      "http://example.com/file1.md",
    );

    const fetchSpy = vi
      .spyOn(JSZip.prototype, "generateAsync")
      .mockRejectedValue(new Error("Fetch failed"));
    const consoleErrorSpy = vi.spyOn(console, "error");

    const { result } = renderHook(() => useAttachmentService({ packageId }), { wrapper });

    await waitFor(() => {
      result.current.onZip(attachments);
    });

    expect(consoleErrorSpy).toBeCalledWith(expect.any(Error));
    expect(fetchSpy).toBeCalledTimes(1);
    expect(getAttachmentUrlSpy).toBeCalledTimes(1);
  });
});
