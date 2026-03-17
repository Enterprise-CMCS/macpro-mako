import { SFNClient } from "@aws-sdk/client-sfn";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  getJsonObject,
  getObjectText,
  objectExists,
  putJsonObject,
  buildAttachmentArchiveSections,
  getAttachmentArchiveSectionById,
  getSignedUrl,
} = vi.hoisted(() => ({
  getJsonObject: vi.fn(),
  getObjectText: vi.fn(),
  objectExists: vi.fn(),
  putJsonObject: vi.fn(),
  buildAttachmentArchiveSections: vi.fn(),
  getAttachmentArchiveSectionById: vi.fn(),
  getSignedUrl: vi.fn(),
}));

vi.mock("../attachment-archive/storage", () => ({
  getJsonObject,
  getObjectText,
  objectExists,
  putJsonObject,
}));

vi.mock("../attachment-archive/package-activity", () => ({
  buildAttachmentArchiveSections,
  getAttachmentArchiveSectionById,
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl,
}));

import {
  buildAttachmentArchiveCurrent,
  buildSectionAttachmentArchiveManifest,
  getArchiveArtifactKey,
  getArchiveManifestKey,
} from "../attachment-archive/archive-manifest";
import {
  getRequestedAttachmentArchiveStatus,
  rebuildPackageAttachmentArchives,
  validateAttachmentArchiveCompletion,
} from "./attachmentArchive-lib";

describe("attachmentArchive-lib", () => {
  const originalArchiveBucketName = process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME;
  const originalStateMachineArn = process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN;
  const originalRebuildStartDelayMs = process.env.ATTACHMENT_ARCHIVE_REBUILD_START_DELAY_MS;
  const stepFunctionsSpy = vi.spyOn(SFNClient.prototype, "send");

  const sectionDescriptor = {
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

  beforeEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = "mako-test-attachment-archives";
    process.env.ATTACHMENT_ARCHIVE_STATE_MACHINE_ARN =
      "arn:aws:states:us-east-1:123456789012:stateMachine:test-attachment-archive";
    process.env.ATTACHMENT_ARCHIVE_REBUILD_START_DELAY_MS = "0";
    buildAttachmentArchiveSections.mockReturnValue([sectionDescriptor]);
    getAttachmentArchiveSectionById.mockReturnValue(sectionDescriptor);
    getSignedUrl.mockResolvedValue("https://example.com/archive.zip");
  });

  afterEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = originalArchiveBucketName;
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
});
