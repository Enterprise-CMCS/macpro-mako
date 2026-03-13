import { describe, expect, it, vi } from "vitest";

import { isSkippableAttachmentError } from "../attachment-errors";
import { loadArchiveAttachment } from "./attachment-source";

describe("attachment-source worker helpers", () => {
  it("classifies missing buckets and access errors as skippable", () => {
    expect(
      isSkippableAttachmentError({
        name: "NoSuchBucket",
        message: "The specified bucket does not exist",
      }),
    ).toBe(true);
    expect(
      isSkippableAttachmentError({
        name: "AccessDenied",
        message: "Access Denied",
      }),
    ).toBe(true);
    expect(
      isSkippableAttachmentError({
        $metadata: { httpStatusCode: 404 },
        message: "Not Found",
      }),
    ).toBe(true);
    expect(isSkippableAttachmentError(new Error("socket hang up"))).toBe(false);
  });

  it("returns the attachment body when the source bucket is readable", async () => {
    const getAttachmentBody = vi.fn().mockResolvedValue("body");

    const result = await loadArchiveAttachment({
      attachment: {
        bucket: "mako-main-attachments-635052997545",
        key: "protected/key/file.pdf",
        filename: "file.pdf",
        title: "File",
      },
      attachmentBucketMap: {},
      consumer: "test",
      getAttachmentBody,
    });

    expect(result).toEqual({
      body: "body",
      skipped: false,
    });
    expect(getAttachmentBody).toHaveBeenCalledWith(
      "mako-main-attachments-635052997545",
      "protected/key/file.pdf",
    );
  });

  it("falls back to the source bucket when a remapped bucket read fails", async () => {
    const getAttachmentBody = vi
      .fn()
      .mockRejectedValueOnce(new Error("NoSuchBucket"))
      .mockResolvedValueOnce("source-body");
    const logWarn = vi.fn();

    const result = await loadArchiveAttachment({
      attachment: {
        bucket: "uploads-develop-attachments-116229642442",
        key: "protected/key/file.pdf",
        filename: "file.pdf",
        title: "File",
      },
      attachmentBucketMap: {
        "uploads-develop-attachments-116229642442": "mako-main-legacy-attachments-635052997545",
      },
      consumer: "test",
      getAttachmentBody,
      logWarn,
    });

    expect(result).toEqual({
      body: "source-body",
      skipped: false,
    });
    expect(getAttachmentBody).toHaveBeenNthCalledWith(
      1,
      "mako-main-legacy-attachments-635052997545",
      "protected/key/file.pdf",
    );
    expect(getAttachmentBody).toHaveBeenNthCalledWith(
      2,
      "uploads-develop-attachments-116229642442",
      "protected/key/file.pdf",
    );
    expect(JSON.parse(logWarn.mock.calls[0][0])).toMatchObject({
      event: "legacy_attachment_remap_fallback",
      bucket: "uploads-develop-attachments-116229642442",
    });
  });

  it("skips unreadable attachments instead of failing the archive", async () => {
    const getAttachmentBody = vi.fn().mockRejectedValue({
      name: "NoSuchBucket",
      message: "The specified bucket does not exist",
    });
    const logWarn = vi.fn();

    const result = await loadArchiveAttachment({
      attachment: {
        bucket: "uploads-develop-attachmentsbucket-10wg5kiraihu1",
        key: "protected/key/file.pdf",
        filename: "file.pdf",
        title: "File",
      },
      attachmentBucketMap: {},
      consumer: "test",
      getAttachmentBody,
      logWarn,
    });

    expect(result).toEqual({
      skipped: true,
    });
    expect(JSON.parse(logWarn.mock.calls[0][0])).toMatchObject({
      event: "attachment_archive_attachment_skipped",
      bucket: "uploads-develop-attachmentsbucket-10wg5kiraihu1",
      key: "protected/key/file.pdf",
      filename: "file.pdf",
    });
  });
});
