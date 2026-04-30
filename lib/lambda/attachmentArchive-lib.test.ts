import { SFNClient } from "@aws-sdk/client-sfn";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../attachment-archive/storage", () => ({
  getJsonObject: vi.fn(),
  getObjectText: vi.fn(),
  objectExists: vi.fn(),
  putJsonObject: vi.fn(),
}));

vi.mock("../attachment-archive/package-activity", () => ({
  buildAttachmentArchiveSections: vi.fn(),
  getAttachmentArchiveSectionById: vi.fn(),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(),
}));

import * as s3RequestPresigner from "@aws-sdk/s3-request-presigner";

import {
  buildAttachmentArchiveCurrent,
  buildPackageAttachmentArchiveManifest,
  buildSectionAttachmentArchiveManifest,
  getArchiveArtifactKey,
  getArchiveManifestKey,
} from "../attachment-archive/archive-manifest";
import * as packageActivity from "../attachment-archive/package-activity";
import * as storage from "../attachment-archive/storage";
import {
  getRequestedAttachmentArchiveDownload,
  getRequestedAttachmentArchiveStatus,
  markAttachmentArchiveFailed,
  rebuildPackageAttachmentArchives,
  validateAttachmentArchiveCompletion,
} from "./attachmentArchive-lib";

describe("attachmentArchive-lib", () => {
  const getJsonObject = vi.mocked(storage.getJsonObject);
  const getObjectText = vi.mocked(storage.getObjectText);
  const objectExists = vi.mocked(storage.objectExists);
  const putJsonObject = vi.mocked(storage.putJsonObject);
  const buildAttachmentArchiveSections = vi.mocked(packageActivity.buildAttachmentArchiveSections);
  const getAttachmentArchiveSectionById = vi.mocked(
    packageActivity.getAttachmentArchiveSectionById,
  );
  const getSignedUrl = vi.mocked(s3RequestPresigner.getSignedUrl);
  const originalArchiveBucketName = process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME;
  const originalArchiveBaseBucketName = process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME;
  const originalArchiveKeyPrefix = process.env.ATTACHMENT_ARCHIVE_KEY_PREFIX;
  const originalStateMachineArn = process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN;
  const originalRebuildStartDelayMs = process.env.ATTACHMENT_ARCHIVE_REBUILD_START_DELAY_MS;
  const stepFunctionsSpy = vi.spyOn(SFNClient.prototype, "send");

  const sectionDescriptor = {
    packageId: "MD-10-6772",
    sectionId: "section-a",
    sectionNumber: 1,
    sectionLabel: "initial-package-submitted",
    sectionFolderName: "section-1-initial-package-submitted",
    rootFolderName: "MD-10-6772-section-1-initial-package-submitted",
    attachments: [
      {
        bucket: "mako-main-attachments-test",
        key: "protected/object.pdf",
        filename: "object.pdf",
        title: "Document",
      },
    ],
  };

  const manifest = buildSectionAttachmentArchiveManifest({
    packageId: "MD-10-6772",
    scope: "section",
    sectionId: sectionDescriptor.sectionId,
    sectionNumber: sectionDescriptor.sectionNumber,
    sectionLabel: sectionDescriptor.sectionLabel,
    sectionFolderName: sectionDescriptor.sectionFolderName,
    rootFolderName: sectionDescriptor.rootFolderName,
    attachments: sectionDescriptor.attachments,
  });
  const artifactKey = getArchiveArtifactKey(
    {
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
    },
    manifest.hash,
  );
  const manifestKey = getArchiveManifestKey(
    {
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
    },
    manifest.hash,
  );
  const packageManifest = buildPackageAttachmentArchiveManifest({
    packageId: "MD-10-6772",
    sections: [
      {
        sectionId: sectionDescriptor.sectionId,
        sectionNumber: sectionDescriptor.sectionNumber,
        sectionLabel: sectionDescriptor.sectionLabel,
        sectionFolderName: sectionDescriptor.sectionFolderName,
        rootFolderName: sectionDescriptor.rootFolderName,
        artifactKey,
        attachmentCount: manifest.attachments.length,
        hash: manifest.hash,
        manifestKey,
      },
    ],
  });
  const packageArtifactKey = getArchiveArtifactKey(
    {
      packageId: "MD-10-6772",
      scope: "all",
    },
    packageManifest.hash,
  );
  const packageManifestKey = getArchiveManifestKey(
    {
      packageId: "MD-10-6772",
      scope: "all",
    },
    packageManifest.hash,
  );

  beforeEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = "mako-test-attachment-archives";
    process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME = "mako-test-attachment-archives";
    process.env.ATTACHMENT_ARCHIVE_KEY_PREFIX = "";
    process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN =
      "arn:aws:states:us-east-1:123456789012:stateMachine:test-attachment-archive";
    process.env.ATTACHMENT_ARCHIVE_REBUILD_START_DELAY_MS = "0";
    buildAttachmentArchiveSections.mockReturnValue([sectionDescriptor]);
    getAttachmentArchiveSectionById.mockReturnValue(sectionDescriptor);
    getSignedUrl.mockResolvedValue("https://example.com/archive.zip");
  });

  afterEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = originalArchiveBucketName;
    process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME = originalArchiveBaseBucketName;
    process.env.ATTACHMENT_ARCHIVE_KEY_PREFIX = originalArchiveKeyPrefix;
    process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN = originalStateMachineArn;
    process.env.ATTACHMENT_ARCHIVE_REBUILD_START_DELAY_MS = originalRebuildStartDelayMs;
    getJsonObject.mockReset();
    getObjectText.mockReset();
    objectExists.mockReset();
    putJsonObject.mockReset();
    buildAttachmentArchiveSections.mockReset();
    getAttachmentArchiveSectionById.mockReset();
    getSignedUrl.mockReset();
    stepFunctionsSpy.mockReset();
  });

  it("marks legacy stale in-progress archives for rebuild", async () => {
    getObjectText.mockResolvedValue(
      JSON.stringify({
        ...buildAttachmentArchiveCurrent({
          scope: "section",
          hash: manifest.hash,
          status: "RUNNING",
          artifactKey,
          manifestKey,
          attachmentCount: 1,
          sectionId: sectionDescriptor.sectionId,
          sectionNumber: sectionDescriptor.sectionNumber,
          sectionLabel: sectionDescriptor.sectionLabel,
          sectionFolderName: sectionDescriptor.sectionFolderName,
        }),
        updatedAt: "2026-03-12T00:00:00.000Z",
      }),
    );

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T01:00:00.000Z"));

    const result = await getRequestedAttachmentArchiveStatus({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: true,
      response: {
        pollAfterSeconds: 3,
        status: "PENDING",
      },
    });

    vi.useRealTimers();
  });

  it("keeps a running archive pending while its execution is active", async () => {
    getObjectText.mockResolvedValue(
      JSON.stringify(
        buildAttachmentArchiveCurrent({
          scope: "section",
          hash: manifest.hash,
          status: "RUNNING",
          artifactKey,
          manifestKey,
          attachmentCount: 1,
          executionArn: "arn:aws:states:us-east-1:123456789012:execution:test:running",
          sectionId: sectionDescriptor.sectionId,
          sectionNumber: sectionDescriptor.sectionNumber,
          sectionLabel: sectionDescriptor.sectionLabel,
          sectionFolderName: sectionDescriptor.sectionFolderName,
        }),
      ),
    );
    stepFunctionsSpy.mockResolvedValue({
      status: "RUNNING",
    } as never);

    const result = await getRequestedAttachmentArchiveStatus({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: false,
      response: {
        pollAfterSeconds: 3,
        status: "PENDING",
      },
    });
  });

  it("rebuilds when a cross-stage execution arn cannot be described", async () => {
    getObjectText.mockResolvedValue(
      JSON.stringify(
        buildAttachmentArchiveCurrent({
          scope: "section",
          hash: manifest.hash,
          status: "RUNNING",
          artifactKey,
          manifestKey,
          attachmentCount: 1,
          executionArn:
            "arn:aws:states:us-east-1:123456789012:execution:migrate-attachment-archive:running",
          sectionId: sectionDescriptor.sectionId,
          sectionNumber: sectionDescriptor.sectionNumber,
          sectionLabel: sectionDescriptor.sectionLabel,
          sectionFolderName: sectionDescriptor.sectionFolderName,
        }),
      ),
    );
    stepFunctionsSpy.mockRejectedValue(
      Object.assign(new Error("not authorized"), {
        name: "AccessDeniedException",
      }),
    );

    const result = await getRequestedAttachmentArchiveStatus({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: true,
      response: {
        pollAfterSeconds: 3,
        status: "PENDING",
      },
    });
  });

  it("returns a terminal failed response for non-clean attachment archives", async () => {
    getObjectText.mockResolvedValue(
      JSON.stringify(
        buildAttachmentArchiveCurrent({
          scope: "section",
          hash: manifest.hash,
          status: "FAILED",
          artifactKey,
          manifestKey,
          attachmentCount: 1,
          sectionId: sectionDescriptor.sectionId,
          sectionNumber: sectionDescriptor.sectionNumber,
          sectionLabel: sectionDescriptor.sectionLabel,
          sectionFolderName: sectionDescriptor.sectionFolderName,
          failureCode: "ATTACHMENT_NOT_CLEAN",
          failureMessage:
            "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
          blockedAttachment: {
            bucket: "mako-main-attachments-635052997545",
            key: "blocked.xlsx",
            filename: "blocked.xlsx",
            title: "Blocked attachment",
            virusScanStatus: "UKNOWNEXT",
          },
        }),
      ),
    );

    const result = await getRequestedAttachmentArchiveStatus({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: false,
      response: {
        status: "FAILED",
        message:
          "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
      },
    });
  });

  it("returns a terminal failed response when all section attachments are unavailable", async () => {
    getObjectText.mockResolvedValue(
      JSON.stringify(
        buildAttachmentArchiveCurrent({
          scope: "section",
          hash: manifest.hash,
          status: "FAILED",
          artifactKey,
          manifestKey,
          attachmentCount: 1,
          appendedAttachmentCount: 0,
          skippedAttachmentCount: 1,
          sectionId: sectionDescriptor.sectionId,
          sectionNumber: sectionDescriptor.sectionNumber,
          sectionLabel: sectionDescriptor.sectionLabel,
          sectionFolderName: sectionDescriptor.sectionFolderName,
          failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
          failureMessage:
            "The attachments in this section are no longer available, so this download could not be created.",
        }),
      ),
    );

    const result = await getRequestedAttachmentArchiveStatus({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: false,
      response: {
        status: "FAILED",
        message:
          "The attachments in this section are no longer available, so this download could not be created.",
      },
    });
  });

  it("returns a ready response with a warning when some attachments were skipped", async () => {
    getObjectText.mockResolvedValue(
      JSON.stringify(
        buildAttachmentArchiveCurrent({
          scope: "section",
          hash: manifest.hash,
          status: "READY",
          artifactKey,
          manifestKey,
          attachmentCount: 2,
          appendedAttachmentCount: 1,
          skippedAttachmentCount: 1,
          sectionId: sectionDescriptor.sectionId,
          sectionNumber: sectionDescriptor.sectionNumber,
          sectionLabel: sectionDescriptor.sectionLabel,
          sectionFolderName: sectionDescriptor.sectionFolderName,
        }),
      ),
    );
    objectExists.mockResolvedValue(true);

    const result = await getRequestedAttachmentArchiveStatus({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: false,
      response: {
        filename: "MD-10-6772-section-1-initial-package-submitted-attachments.zip",
        status: "READY",
        url: "https://example.com/archive.zip",
        warningMessage:
          "Some attachments in this download are no longer available and were not included.",
      },
    });
  });

  it("returns unsigned archive download details for external callers", async () => {
    getObjectText.mockResolvedValue(
      JSON.stringify(
        buildAttachmentArchiveCurrent({
          scope: "section",
          hash: manifest.hash,
          status: "READY",
          artifactKey,
          manifestKey,
          attachmentCount: 2,
          appendedAttachmentCount: 1,
          skippedAttachmentCount: 1,
          sectionId: sectionDescriptor.sectionId,
          sectionNumber: sectionDescriptor.sectionNumber,
          sectionLabel: sectionDescriptor.sectionLabel,
          sectionFolderName: sectionDescriptor.sectionFolderName,
        }),
      ),
    );
    objectExists.mockResolvedValue(true);

    const result = await getRequestedAttachmentArchiveDownload({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: false,
      response: {
        status: "READY",
        bucketName: "mako-test-attachment-archives",
        artifactKey,
        filename: "MD-10-6772-section-1-initial-package-submitted-attachments.zip",
        warningMessage:
          "Some attachments in this download are no longer available and were not included.",
      },
    });
  });

  it("returns a date-based package download filename in Eastern Time", async () => {
    getObjectText.mockResolvedValue(
      JSON.stringify(
        buildAttachmentArchiveCurrent({
          scope: "all",
          hash: packageManifest.hash,
          status: "READY",
          artifactKey: packageArtifactKey,
          manifestKey: packageManifestKey,
          attachmentCount: 1,
          appendedAttachmentCount: 1,
        }),
      ),
    );
    objectExists.mockResolvedValue(true);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-23T18:00:00.000Z"));

    const result = await getRequestedAttachmentArchiveStatus({
      packageId: "MD-10-6772",
      scope: "all",
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: false,
      response: {
        filename: "MD-10-6772 - Mon Mar 23 2026.zip",
        status: "READY",
        url: "https://example.com/archive.zip",
      },
    });

    vi.useRealTimers();
  });

  it("fails validation when the current state is not ready", async () => {
    getJsonObject.mockResolvedValue({
      scope: "section",
      status: "RUNNING",
      hash: manifest.hash,
      artifactKey,
      manifestKey,
      attachmentCount: 1,
      updatedAt: new Date().toISOString(),
      version: 2,
    });

    await expect(
      validateAttachmentArchiveCompletion({
        archiveBucketName: "mako-test-attachment-archives",
        currentKey: "package/MD-10-6772/section/section-a/current.json",
        hash: manifest.hash,
        artifactKey,
      }),
    ).rejects.toThrow("is RUNNING, expected READY");
  });

  it("fails validation when the ready artifact is missing", async () => {
    getJsonObject.mockResolvedValue({
      scope: "section",
      status: "READY",
      hash: manifest.hash,
      artifactKey,
      manifestKey,
      attachmentCount: 1,
      updatedAt: new Date().toISOString(),
      version: 2,
    });
    objectExists.mockResolvedValue(false);

    await expect(
      validateAttachmentArchiveCompletion({
        archiveBucketName: "mako-test-attachment-archives",
        currentKey: "package/MD-10-6772/section/section-a/current.json",
        hash: manifest.hash,
        artifactKey,
      }),
    ).rejects.toThrow(`Attachment archive artifact was not found at ${artifactKey}`);
  });

  it("paces rebuild starts and reports how many artifacts were started", async () => {
    getObjectText.mockResolvedValue(undefined);
    stepFunctionsSpy.mockResolvedValue({} as never);

    const result = await rebuildPackageAttachmentArchives({
      packageId: "MD-10-6772",
      changelog: [],
    });

    expect(result).toMatchObject({
      packageId: "MD-10-6772",
      packageStatus: "PENDING",
      rebuildStartDelayMs: 0,
      startedArtifactCount: 2,
      delayedStartCount: 0,
      sectionResults: [
        {
          sectionId: "section-a",
          started: true,
          status: "PENDING",
        },
      ],
    });
    expect(stepFunctionsSpy).toHaveBeenCalledTimes(2);
    expect(putJsonObject).toHaveBeenCalled();
  });

  it("uses a dedicated draft archive namespace when rebuilding synthetic draft archives", async () => {
    getObjectText.mockResolvedValue(undefined);
    stepFunctionsSpy.mockResolvedValue({} as never);

    await rebuildPackageAttachmentArchives({
      packageId: "MD-10-6772",
      changelog: [],
      archiveNamespace: "draft",
    });

    expect(putJsonObject).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringContaining("package/MD-10-6772/draft/section/section-a/"),
      }),
    );
    expect(putJsonObject).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringContaining("package/MD-10-6772/draft/all/"),
      }),
    );
  });

  it("returns a ready response from the base archive bucket when the overlay is missing", async () => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = "mako-ephemeral-attachment-archives";
    process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME = "mako-main-attachment-archives";
    process.env.ATTACHMENT_ARCHIVE_KEY_PREFIX = "stage/migrate";

    getObjectText.mockImplementation(async ({ bucket, key }) => {
      if (
        bucket === "mako-main-attachment-archives" &&
        key === `package/MD-10-6772/section/${sectionDescriptor.sectionId}/current.json`
      ) {
        return JSON.stringify(
          buildAttachmentArchiveCurrent({
            scope: "section",
            hash: manifest.hash,
            status: "READY",
            artifactKey,
            manifestKey,
            attachmentCount: 1,
            sectionId: sectionDescriptor.sectionId,
            sectionNumber: sectionDescriptor.sectionNumber,
            sectionLabel: sectionDescriptor.sectionLabel,
            sectionFolderName: sectionDescriptor.sectionFolderName,
          }),
        );
      }

      return undefined;
    });
    objectExists.mockResolvedValue(true);

    const result = await getRequestedAttachmentArchiveStatus({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: false,
      response: {
        filename: "MD-10-6772-section-1-initial-package-submitted-attachments.zip",
        status: "READY",
        url: "https://example.com/archive.zip",
      },
    });
    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: expect.objectContaining({
          Bucket: "mako-main-attachment-archives",
          Key: artifactKey,
        }),
      }),
      expect.anything(),
    );
  });

  it("returns base-bucket unsigned archive download details when the overlay is missing", async () => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = "mako-ephemeral-attachment-archives";
    process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME = "mako-main-attachment-archives";
    process.env.ATTACHMENT_ARCHIVE_KEY_PREFIX = "stage/migrate";

    getObjectText.mockImplementation(async ({ bucket, key }) => {
      if (
        bucket === "mako-main-attachment-archives" &&
        key === `package/MD-10-6772/section/${sectionDescriptor.sectionId}/current.json`
      ) {
        return JSON.stringify(
          buildAttachmentArchiveCurrent({
            scope: "section",
            hash: manifest.hash,
            status: "READY",
            artifactKey,
            manifestKey,
            attachmentCount: 1,
            sectionId: sectionDescriptor.sectionId,
            sectionNumber: sectionDescriptor.sectionNumber,
            sectionLabel: sectionDescriptor.sectionLabel,
            sectionFolderName: sectionDescriptor.sectionFolderName,
          }),
        );
      }

      return undefined;
    });
    objectExists.mockResolvedValue(true);

    const result = await getRequestedAttachmentArchiveDownload({
      packageId: "MD-10-6772",
      scope: "section",
      sectionId: sectionDescriptor.sectionId,
      changelog: [],
    });

    expect(result).toEqual({
      needsRebuild: false,
      response: {
        status: "READY",
        bucketName: "mako-main-attachment-archives",
        artifactKey,
        filename: "MD-10-6772-section-1-initial-package-submitted-attachments.zip",
      },
    });
  });

  it("reuses ready base section manifests when rebuilding a mixed package in the overlay", async () => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = "mako-ephemeral-attachment-archives";
    process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME = "mako-main-attachment-archives";
    process.env.ATTACHMENT_ARCHIVE_KEY_PREFIX = "stage/migrate";

    const writeSectionManifestKey = `stage/migrate/${manifestKey}`;
    const writeSectionCurrentKey = `stage/migrate/package/MD-10-6772/section/${sectionDescriptor.sectionId}/current.json`;
    const writePackageCurrentKey = "stage/migrate/package/MD-10-6772/all/current.json";

    getObjectText.mockImplementation(async ({ bucket, key }) => {
      if (bucket === "mako-ephemeral-attachment-archives" && key === writeSectionCurrentKey) {
        return undefined;
      }

      if (
        bucket === "mako-main-attachment-archives" &&
        key === `package/MD-10-6772/section/${sectionDescriptor.sectionId}/current.json`
      ) {
        return JSON.stringify(
          buildAttachmentArchiveCurrent({
            scope: "section",
            hash: manifest.hash,
            status: "READY",
            artifactKey,
            manifestKey,
            attachmentCount: 1,
            sectionId: sectionDescriptor.sectionId,
            sectionNumber: sectionDescriptor.sectionNumber,
            sectionLabel: sectionDescriptor.sectionLabel,
            sectionFolderName: sectionDescriptor.sectionFolderName,
          }),
        );
      }

      if (bucket === "mako-ephemeral-attachment-archives" && key === writeSectionManifestKey) {
        return undefined;
      }

      if (bucket === "mako-ephemeral-attachment-archives" && key === writePackageCurrentKey) {
        return undefined;
      }

      if (
        bucket === "mako-main-attachment-archives" &&
        key === "package/MD-10-6772/all/current.json"
      ) {
        return JSON.stringify(
          buildAttachmentArchiveCurrent({
            scope: "all",
            hash: "old-package-hash",
            status: "READY",
            artifactKey: "package/MD-10-6772/all/old-package-hash.zip",
            manifestKey: "package/MD-10-6772/all/old-package-hash.manifest.json",
            attachmentCount: 1,
          }),
        );
      }

      return undefined;
    });
    getJsonObject.mockImplementation(async ({ bucket, key }) => {
      if (bucket === "mako-main-attachment-archives" && key === manifestKey) {
        return manifest;
      }

      return undefined;
    });
    objectExists.mockResolvedValue(true);
    stepFunctionsSpy.mockResolvedValue({} as never);

    const result = await rebuildPackageAttachmentArchives({
      packageId: "MD-10-6772",
      changelog: [],
    });

    expect(result).toMatchObject({
      packageId: "MD-10-6772",
      packageStatus: "PENDING",
      startedArtifactCount: 1,
      sectionResults: [
        {
          sectionId: "section-a",
          started: false,
          status: "READY",
        },
      ],
    });
    expect(putJsonObject).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "mako-ephemeral-attachment-archives",
        key: writeSectionManifestKey,
        body: manifest,
      }),
    );
    expect(stepFunctionsSpy).toHaveBeenCalledTimes(1);
  });

  it("preserves structured worker failures when the step function failure handler runs", async () => {
    getJsonObject.mockResolvedValue(
      buildAttachmentArchiveCurrent({
        scope: "section",
        hash: manifest.hash,
        status: "FAILED",
        artifactKey,
        manifestKey,
        attachmentCount: 1,
        sectionId: sectionDescriptor.sectionId,
        sectionNumber: sectionDescriptor.sectionNumber,
        sectionLabel: sectionDescriptor.sectionLabel,
        sectionFolderName: sectionDescriptor.sectionFolderName,
        failureCode: "ATTACHMENT_NOT_CLEAN",
        failureMessage:
          "Unable to prepare the attachment archive because blocked.xlsx is not available for download. File scanning did not complete successfully.",
        blockedAttachment: {
          bucket: "mako-main-attachments-635052997545",
          key: "blocked.xlsx",
          filename: "blocked.xlsx",
          title: "Blocked attachment",
          virusScanStatus: "UKNOWNEXT",
        },
      }),
    );

    const result = await markAttachmentArchiveFailed({
      archiveBucketName: "mako-test-attachment-archives",
      currentKey: `package/MD-10-6772/section/${sectionDescriptor.sectionId}/current.json`,
      hash: manifest.hash,
      artifactKey,
      manifestKey,
      attachmentCount: 1,
      errorMessage: "Task failed",
    });

    expect(result).toEqual({
      skipped: true,
      reason: "preserve_terminal_failure",
    });
    expect(putJsonObject).not.toHaveBeenCalled();
  });

  it("preserves all-unavailable worker failures when the step function failure handler runs", async () => {
    getJsonObject.mockResolvedValue(
      buildAttachmentArchiveCurrent({
        scope: "section",
        hash: manifest.hash,
        status: "FAILED",
        artifactKey,
        manifestKey,
        attachmentCount: 1,
        appendedAttachmentCount: 0,
        skippedAttachmentCount: 1,
        sectionId: sectionDescriptor.sectionId,
        sectionNumber: sectionDescriptor.sectionNumber,
        sectionLabel: sectionDescriptor.sectionLabel,
        sectionFolderName: sectionDescriptor.sectionFolderName,
        failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
        failureMessage:
          "The attachments in this section are no longer available, so this download could not be created.",
      }),
    );

    const result = await markAttachmentArchiveFailed({
      archiveBucketName: "mako-test-attachment-archives",
      currentKey: `package/MD-10-6772/section/${sectionDescriptor.sectionId}/current.json`,
      hash: manifest.hash,
      artifactKey,
      manifestKey,
      attachmentCount: 1,
      errorMessage: "Task failed",
    });

    expect(result).toEqual({
      skipped: true,
      reason: "preserve_terminal_failure",
    });
    expect(putJsonObject).not.toHaveBeenCalled();
  });
});
