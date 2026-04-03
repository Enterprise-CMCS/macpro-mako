import { describe, expect, it, vi } from "vitest";

import {
  isAttachmentAccessDeniedError,
  isAttachmentNotFoundError,
  isLegacyAttachmentUnavailableError,
} from "../attachment-errors";
import { loadArchiveAttachment } from "./attachment-source";

describe("attachment-source worker helpers", () => {
  it("classifies missing buckets and legacy access errors separately", () => {
    expect(
      isAttachmentNotFoundError({
        name: "NoSuchBucket",
        message: "The specified bucket does not exist",
      }),
    ).toBe(true);
    expect(
      isLegacyAttachmentUnavailableError("uploads-develop-attachments-legacy", {
        name: "AccessDenied",
        message: "Access Denied",
      }),
    ).toBe(true);
    expect(
      isAttachmentAccessDeniedError({
        $metadata: { httpStatusCode: 403 },
        message: "Forbidden",
      }),
    ).toBe(true);
    expect(
      isLegacyAttachmentUnavailableError("mako-main-attachments-635052997545", {
        name: "AccessDenied",
        message: "Access Denied",
      }),
    ).toBe(false);
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
      .mockRejectedValueOnce({
        name: "NoSuchKey",
        message: "The specified key does not exist",
      })
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

  it("falls back to the source bucket when a remapped bucket returns access denied", async () => {
    const getAttachmentBody = vi
      .fn()
      .mockRejectedValueOnce({
        name: "AccessDenied",
        message: "Access Denied",
        $metadata: { httpStatusCode: 403 },
      })
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
      destinationBucket: "mako-main-legacy-attachments-635052997545",
    });
  });

  it("fails when a remapped bucket access denial is blocked by scan", async () => {
    const getAttachmentBody = vi.fn().mockRejectedValueOnce({
      name: "AccessDenied",
      message: "Access Denied",
      $metadata: { httpStatusCode: 403 },
    });
    const getObjectTags = vi.fn().mockResolvedValue({
      virusScanStatus: "INFECTED",
    });
    const logWarn = vi.fn();

    await expect(
      loadArchiveAttachment({
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
        getObjectTags,
        logWarn,
      }),
    ).rejects.toMatchObject({
      failureCode: "ATTACHMENT_NOT_CLEAN",
      failureMessage:
        "Unable to prepare the attachment archive because file.pdf is not available for download. File scanning did not complete successfully.",
      blockedAttachment: {
        bucket: "mako-main-legacy-attachments-635052997545",
        key: "protected/key/file.pdf",
        filename: "file.pdf",
        title: "File",
        virusScanStatus: "INFECTED",
      },
    });

    expect(getAttachmentBody).toHaveBeenCalledTimes(1);
    expect(getAttachmentBody).toHaveBeenCalledWith(
      "mako-main-legacy-attachments-635052997545",
      "protected/key/file.pdf",
    );
    expect(getObjectTags).toHaveBeenCalledWith(
      "mako-main-legacy-attachments-635052997545",
      "protected/key/file.pdf",
    );
    expect(logWarn).not.toHaveBeenCalledWith(
      expect.stringContaining("legacy_attachment_remap_fallback"),
    );
  });

  it("still falls back when remapped access denial has a clean scan tag", async () => {
    const getAttachmentBody = vi
      .fn()
      .mockRejectedValueOnce({
        name: "AccessDenied",
        message: "Access Denied",
        $metadata: { httpStatusCode: 403 },
      })
      .mockResolvedValueOnce("source-body");
    const getObjectTags = vi.fn().mockResolvedValue({
      virusScanStatus: "CLEAN",
    });
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
      getObjectTags,
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
    expect(getObjectTags).toHaveBeenCalledWith(
      "mako-main-legacy-attachments-635052997545",
      "protected/key/file.pdf",
    );
    expect(JSON.parse(logWarn.mock.calls[0][0])).toMatchObject({
      event: "legacy_attachment_remap_fallback",
      bucket: "uploads-develop-attachments-116229642442",
      destinationBucket: "mako-main-legacy-attachments-635052997545",
    });
  });

  it("fails when fallback to source bucket is access denied and source scan tag is non-clean", async () => {
    const sourceBucket = "uploads-develop-attachments-116229642442";
    const getAttachmentBody = vi
      .fn()
      .mockRejectedValueOnce({
        name: "NoSuchKey",
        message: "The specified key does not exist",
      })
      .mockRejectedValueOnce({
        name: "AccessDenied",
        message: "Access Denied",
        $metadata: { httpStatusCode: 403 },
      });
    const getObjectTags = vi.fn().mockResolvedValue({
      virusScanStatus: "INFECTED",
    });
    const logWarn = vi.fn();

    await expect(
      loadArchiveAttachment({
        attachment: {
          bucket: sourceBucket,
          key: "protected/key/file.pdf",
          filename: "file.pdf",
          title: "File",
        },
        attachmentBucketMap: {
          [sourceBucket]: "mako-main-legacy-attachments-635052997545",
        },
        consumer: "test",
        getAttachmentBody,
        getObjectTags,
        logWarn,
      }),
    ).rejects.toMatchObject({
      failureCode: "ATTACHMENT_NOT_CLEAN",
      blockedAttachment: {
        bucket: sourceBucket,
        key: "protected/key/file.pdf",
        filename: "file.pdf",
        title: "File",
        virusScanStatus: "INFECTED",
      },
    });

    expect(getAttachmentBody).toHaveBeenNthCalledWith(
      1,
      "mako-main-legacy-attachments-635052997545",
      "protected/key/file.pdf",
    );
    expect(getAttachmentBody).toHaveBeenNthCalledWith(2, sourceBucket, "protected/key/file.pdf");
    expect(getObjectTags).toHaveBeenCalledWith(sourceBucket, "protected/key/file.pdf");
  });

  it("skips attachment when fallback source access denied has a clean scan tag", async () => {
    const sourceBucket = "uploads-develop-attachments-116229642442";
    const getAttachmentBody = vi
      .fn()
      .mockRejectedValueOnce({
        name: "NoSuchKey",
        message: "The specified key does not exist",
      })
      .mockRejectedValueOnce({
        name: "AccessDenied",
        message: "Access Denied",
        $metadata: { httpStatusCode: 403 },
      });
    const getObjectTags = vi.fn().mockResolvedValue({
      virusScanStatus: "CLEAN",
    });
    const logWarn = vi.fn();

    const result = await loadArchiveAttachment({
      attachment: {
        bucket: sourceBucket,
        key: "protected/key/file.pdf",
        filename: "file.pdf",
        title: "File",
      },
      attachmentBucketMap: {
        [sourceBucket]: "mako-main-legacy-attachments-635052997545",
      },
      consumer: "test",
      getAttachmentBody,
      getObjectTags,
      logWarn,
    });

    expect(result).toEqual({
      skipped: true,
    });
    expect(getAttachmentBody).toHaveBeenNthCalledWith(
      1,
      "mako-main-legacy-attachments-635052997545",
      "protected/key/file.pdf",
    );
    expect(getAttachmentBody).toHaveBeenNthCalledWith(2, sourceBucket, "protected/key/file.pdf");
    expect(getObjectTags).toHaveBeenCalledWith(sourceBucket, "protected/key/file.pdf");
    expect(JSON.parse(logWarn.mock.calls[1][0])).toMatchObject({
      event: "attachment_archive_attachment_skipped",
      bucket: sourceBucket,
      destinationBucket: "mako-main-legacy-attachments-635052997545",
      key: "protected/key/file.pdf",
      filename: "file.pdf",
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

  it("fails the archive when a canonical bucket returns access denied", async () => {
    const getAttachmentBody = vi.fn().mockRejectedValue({
      name: "AccessDenied",
      message: "Access Denied",
      $metadata: { httpStatusCode: 403 },
    });

    await expect(
      loadArchiveAttachment({
        attachment: {
          bucket: "mako-main-attachments-635052997545",
          key: "protected/key/file.pdf",
          filename: "file.pdf",
          title: "File",
        },
        attachmentBucketMap: {},
        consumer: "test",
        getAttachmentBody,
      }),
    ).rejects.toMatchObject({
      name: "AccessDenied",
    });
  });
});
