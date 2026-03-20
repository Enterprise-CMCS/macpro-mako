import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "@/api";

import { useAttachmentService } from "./hook";

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}> {children}</QueryClientProvider>
);

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

    const getAttachmentUrlSpy = vi
      .spyOn(api, "getAttachmentUrl")
      .mockResolvedValue("http://example.com/testFile");

    const { result } = renderHook(() => useAttachmentService({ packageId }), {
      wrapper,
    });

    const url = await result.current.onUrl(attachment);

    expect(getAttachmentUrlSpy).toHaveBeenCalledWith(
      packageId,
      attachment.bucket,
      attachment.key,
      attachment.filename,
    );
    expect(url).toBe("http://example.com/testFile");
    expect(result.current.attachmentErrorMessage).toBeUndefined();
  });

  it("stores an attachment error message when an individual attachment download fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const attachment = {
      title: "Test Bucket",
      bucket: "testBucket",
      key: "testKey",
      filename: "testFile",
      uploadDate: 123232,
    };

    vi.spyOn(api, "getAttachmentUrl").mockRejectedValue({
      response: {
        data: {
          message: "This attachment is no longer available.",
        },
      },
    });

    const { result } = renderHook(() => useAttachmentService({ packageId: "testPackage" }), {
      wrapper,
    });

    await expect(result.current.onUrl(attachment)).resolves.toBeUndefined();

    await waitFor(() => {
      expect(result.current.attachmentErrorMessage).toBe("This attachment is no longer available.");
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("returns the archive url immediately when the archive is ready", async () => {
    vi.spyOn(api, "getAttachmentArchive").mockResolvedValue({
      status: "READY",
      filename: "testPackage-attachments.zip",
      url: "http://example.com/archive.zip",
    });

    const { result } = renderHook(() => useAttachmentService({ packageId: "testPackage" }), {
      wrapper,
    });

    await expect(result.current.onArchive({ scope: "all" })).resolves.toBe(
      "http://example.com/archive.zip",
    );
  });

  it("polls pending archive responses until a ready archive is available", async () => {
    vi.useFakeTimers();

    const getAttachmentArchiveSpy = vi
      .spyOn(api, "getAttachmentArchive")
      .mockResolvedValueOnce({
        status: "PENDING",
        pollAfterSeconds: 1,
      })
      .mockResolvedValueOnce({
        status: "READY",
        filename: "testPackage-attachments.zip",
        url: "http://example.com/archive.zip",
      });

    const { result } = renderHook(() => useAttachmentService({ packageId: "testPackage" }), {
      wrapper,
    });

    const archivePromise = result.current.onArchive({ scope: "all" });

    await vi.advanceTimersByTimeAsync(1000);

    await expect(archivePromise).resolves.toBe("http://example.com/archive.zip");
    expect(getAttachmentArchiveSpy).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("stores an archive error message when archive generation fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(api, "getAttachmentArchive").mockResolvedValue({
      status: "FAILED",
      message: "Archive generation failed",
    });

    const { result } = renderHook(() => useAttachmentService({ packageId: "testPackage" }), {
      wrapper,
    });

    await expect(result.current.onArchive({ scope: "all" })).resolves.toBeUndefined();

    await waitFor(() => {
      expect(result.current.archiveErrorMessage).toBe("Archive generation failed");
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("stops polling when the backend returns a terminal archive failure", async () => {
    vi.useFakeTimers();
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const getAttachmentArchiveSpy = vi
      .spyOn(api, "getAttachmentArchive")
      .mockResolvedValueOnce({
        status: "PENDING",
        pollAfterSeconds: 1,
      })
      .mockResolvedValueOnce({
        status: "FAILED",
        message:
          "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      });

    const { result } = renderHook(() => useAttachmentService({ packageId: "testPackage" }), {
      wrapper,
    });

    const archivePromise = result.current.onArchive({ scope: "all" });
    await vi.advanceTimersByTimeAsync(1000);

    await expect(archivePromise).resolves.toBeUndefined();
    await waitFor(() => {
      expect(result.current.archiveErrorMessage).toBe(
        "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      );
    });
    expect(getAttachmentArchiveSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
