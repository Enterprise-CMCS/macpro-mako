import { Readable } from "stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type JsonStore = Map<string, any>;

const originalEnv = {
  ARCHIVE_BUCKET_NAME: process.env.ARCHIVE_BUCKET_NAME,
  ARCHIVE_CURRENT_KEY: process.env.ARCHIVE_CURRENT_KEY,
  ARCHIVE_MANIFEST_KEY: process.env.ARCHIVE_MANIFEST_KEY,
  ARCHIVE_ARTIFACT_KEY: process.env.ARCHIVE_ARTIFACT_KEY,
  ATTACHMENT_ARCHIVE_HASH: process.env.ATTACHMENT_ARCHIVE_HASH,
  AWS_REGION: process.env.AWS_REGION,
  region: process.env.region,
  LEGACY_ATTACHMENT_BUCKET_MAP: process.env.LEGACY_ATTACHMENT_BUCKET_MAP,
  LEGACY_S3_ACCESS_ROLE_ARN: process.env.LEGACY_S3_ACCESS_ROLE_ARN,
};

function buildSectionManifest() {
  return {
    version: 2,
    buildVersion: 2,
    type: "section" as const,
    packageId: "CO-25-0002-1960",
    scope: "section" as const,
    sectionId: "CO-25-0002-1960-52418",
    sectionNumber: 1,
    sectionLabel: "initial-package-submitted",
    sectionFolderName: "section-1-initial-package-submitted",
    rootFolderName: "CO-25-0002-1960-section-1-initial-package-submitted",
    hash: "test-hash",
    createdAt: "2026-04-20T19:37:20.032Z",
    attachments: [
      {
        bucket: "mako-val-attachments-169888657886",
        key: "attachment-1.docx",
        filename: "attachment-1.docx",
        title: "Attachment 1",
        uploadDate: 1776173963341,
        archiveFilename: "attachment-1.docx",
        archivePath: "CO-25-0002-1960-section-1-initial-package-submitted/attachment-1.docx",
      },
    ],
  };
}

function buildCurrent() {
  return {
    version: 2,
    scope: "section" as const,
    hash: "test-hash",
    status: "PENDING" as const,
    artifactKey: "package/CO-25-0002-1960/section/CO-25-0002-1960-52418/test-hash.zip",
    manifestKey: "package/CO-25-0002-1960/section/CO-25-0002-1960-52418/test-hash.manifest.json",
    attachmentCount: 1,
    executionArn: "arn:aws:states:us-east-1:123456789012:execution:test:run-1",
    sectionId: "CO-25-0002-1960-52418",
    sectionNumber: 1,
    sectionLabel: "initial-package-submitted",
    sectionFolderName: "section-1-initial-package-submitted",
  };
}

describe("attachment archive worker runtime", () => {
  let archiveMock: {
    abort: ReturnType<typeof vi.fn>;
    append: ReturnType<typeof vi.fn>;
    finalize: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
    pipe: ReturnType<typeof vi.fn>;
  };
  let createReadStreamMock: ReturnType<typeof vi.fn>;
  let createWriteStreamMock: ReturnType<typeof vi.fn>;
  let finishedMock: ReturnType<typeof vi.fn>;
  let getJsonObjectMock: ReturnType<typeof vi.fn>;
  let jsonStore: JsonStore;
  let putJsonObjectMock: ReturnType<typeof vi.fn>;
  let rmMock: ReturnType<typeof vi.fn>;
  let s3SendMock: ReturnType<typeof vi.fn>;
  let uploadDoneMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();

    process.env.ARCHIVE_BUCKET_NAME = "archive-write-bucket";
    process.env.ARCHIVE_CURRENT_KEY =
      "package/CO-25-0002-1960/section/CO-25-0002-1960-52418/test-hash/current.json";
    process.env.ARCHIVE_MANIFEST_KEY =
      "package/CO-25-0002-1960/section/CO-25-0002-1960-52418/test-hash.manifest.json";
    process.env.ARCHIVE_ARTIFACT_KEY =
      "package/CO-25-0002-1960/section/CO-25-0002-1960-52418/test-hash.zip";
    process.env.ATTACHMENT_ARCHIVE_HASH = "test-hash";
    process.env.AWS_REGION = "us-east-1";
    process.env.region = "us-east-1";
    process.env.LEGACY_ATTACHMENT_BUCKET_MAP = "{}";
    delete process.env.LEGACY_S3_ACCESS_ROLE_ARN;

    jsonStore = new Map<string, any>();
    jsonStore.set(process.env.ARCHIVE_CURRENT_KEY as string, buildCurrent());
    jsonStore.set(process.env.ARCHIVE_MANIFEST_KEY as string, buildSectionManifest());
    getJsonObjectMock = vi.fn(async ({ key }: { key: string }) => jsonStore.get(key));
    putJsonObjectMock = vi.fn(async ({ key, body }: { key: string; body: unknown }) => {
      jsonStore.set(key, body);
    });

    const archiveFileStream = {
      destroy: vi.fn(),
    };

    archiveMock = {
      abort: vi.fn(),
      append: vi.fn(),
      finalize: vi.fn().mockResolvedValue(undefined),
      on: vi.fn().mockReturnThis(),
      pipe: vi.fn(),
    };
    createReadStreamMock = vi.fn(() => Readable.from(["zip-body"]));
    createWriteStreamMock = vi.fn(() => archiveFileStream);
    finishedMock = vi.fn().mockResolvedValue(undefined);
    rmMock = vi.fn().mockResolvedValue(undefined);
    uploadDoneMock = vi.fn().mockResolvedValue(undefined);
    s3SendMock = vi.fn(async (command: { input?: { Bucket?: string; Key?: string } }) => {
      if (command.input?.Bucket?.includes("attachments")) {
        return {
          Body: Readable.from(["attachment-body"]),
        };
      }

      return {};
    });

    vi.doMock("../storage", () => ({
      getJsonObject: getJsonObjectMock,
      putJsonObject: putJsonObjectMock,
    }));
    vi.doMock("../bucket-routing", () => ({
      createAttachmentBucketClientFactory: () => () => ({
        send: s3SendMock,
      }),
      getAttachmentBucketMap: () => ({}),
      resolveTargetBucket: (bucket: string) => ({
        remapped: false,
        sourceBucket: bucket,
      }),
    }));
    vi.doMock("@aws-sdk/client-s3", () => ({
      GetObjectCommand: class GetObjectCommand {
        input: Record<string, unknown>;
        constructor(input: Record<string, unknown>) {
          this.input = input;
        }
      },
      GetObjectTaggingCommand: class GetObjectTaggingCommand {
        input: Record<string, unknown>;
        constructor(input: Record<string, unknown>) {
          this.input = input;
        }
      },
      S3Client: class S3Client {
        send = s3SendMock;
      },
    }));
    vi.doMock("@aws-sdk/lib-storage", () => ({
      Upload: class Upload {
        done = uploadDoneMock;
      },
    }));
    vi.doMock("archiver", () => ({
      default: vi.fn(() => archiveMock),
    }));
    vi.doMock("fs", () => ({
      createReadStream: createReadStreamMock,
      createWriteStream: createWriteStreamMock,
      promises: {
        rm: rmMock,
      },
    }));
    vi.doMock("stream/promises", () => ({
      finished: finishedMock,
    }));
  });

  afterEach(() => {
    process.env.ARCHIVE_BUCKET_NAME = originalEnv.ARCHIVE_BUCKET_NAME;
    process.env.ARCHIVE_CURRENT_KEY = originalEnv.ARCHIVE_CURRENT_KEY;
    process.env.ARCHIVE_MANIFEST_KEY = originalEnv.ARCHIVE_MANIFEST_KEY;
    process.env.ARCHIVE_ARTIFACT_KEY = originalEnv.ARCHIVE_ARTIFACT_KEY;
    process.env.ATTACHMENT_ARCHIVE_HASH = originalEnv.ATTACHMENT_ARCHIVE_HASH;
    process.env.AWS_REGION = originalEnv.AWS_REGION;
    process.env.region = originalEnv.region;
    process.env.LEGACY_ATTACHMENT_BUCKET_MAP = originalEnv.LEGACY_ATTACHMENT_BUCKET_MAP;
    process.env.LEGACY_S3_ACCESS_ROLE_ARN = originalEnv.LEGACY_S3_ACCESS_ROLE_ARN;
  });

  it("logs finalize, upload, and current-write stages on the successful path", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await import("./index");

    const events = infoSpy.mock.calls.map(([entry]) => JSON.parse(String(entry)).event);
    expect(events).toContain("attachment_archive_finalize_starting");
    expect(events).toContain("attachment_archive_finalize_completed");
    expect(events).toContain("attachment_archive_file_stream_completed");
    expect(events).toContain("attachment_archive_upload_starting");
    expect(events).toContain("attachment_archive_upload_completed");
    expect(events).toContain("attachment_archive_current_status_write_starting");
    expect(events).toContain("attachment_archive_current_status_write_completed");
    expect(events).toContain("attachment_archive_ready");
    expect(errorSpy).not.toHaveBeenCalled();

    expect(jsonStore.get(process.env.ARCHIVE_CURRENT_KEY as string)).toMatchObject({
      status: "READY",
      appendedAttachmentCount: 1,
      skippedAttachmentCount: 0,
    });
  });

  it("does not emit upload logs when all attachments are unavailable", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    s3SendMock.mockImplementation(async () => {
      throw {
        name: "NoSuchKey",
        message: "The specified key does not exist.",
        $metadata: {
          httpStatusCode: 404,
        },
      };
    });

    await import("./index");

    const events = infoSpy.mock.calls.map(([entry]) => JSON.parse(String(entry)).event);
    expect(events).toContain("attachment_archive_zip_build_completed");
    expect(events).toContain("attachment_archive_current_status_write_starting");
    expect(events).toContain("attachment_archive_current_status_write_completed");
    expect(events).toContain("attachment_archive_all_attachments_unavailable");
    expect(events).not.toContain("attachment_archive_upload_starting");
    expect(events).not.toContain("attachment_archive_upload_completed");

    expect(jsonStore.get(process.env.ARCHIVE_CURRENT_KEY as string)).toMatchObject({
      status: "FAILED",
      failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
      skippedAttachmentCount: 1,
    });
  });

  it("marks the current state failed when finalize throws after zip build", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    archiveMock.finalize.mockRejectedValue(new Error("finalize boom"));

    await import("./index");

    expect(errorSpy).toHaveBeenCalledWith(
      JSON.stringify({
        event: "attachment_archive_failed",
        artifactKey: process.env.ARCHIVE_ARTIFACT_KEY,
        currentKey: process.env.ARCHIVE_CURRENT_KEY,
        hash: process.env.ATTACHMENT_ARCHIVE_HASH,
        message: "finalize boom",
      }),
    );
    expect(jsonStore.get(process.env.ARCHIVE_CURRENT_KEY as string)).toMatchObject({
      status: "FAILED",
      errorMessage: "finalize boom",
    });
  });
});
