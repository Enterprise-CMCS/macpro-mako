import { S3Client } from "@aws-sdk/client-s3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildAttachmentArchiveCurrent,
  buildPackageAttachmentArchiveManifest,
  buildSectionAttachmentArchiveManifest,
  getArchiveArtifactKey,
  getArchiveCurrentKey,
  getArchiveManifestKey,
} from "../attachment-archive/archive-manifest";
import { listAllAttachmentArchivePackageIds } from "../attachment-archive/backfill";
import { buildAttachmentArchiveSections } from "../attachment-archive/package-activity";
import { getPackage, getPackageChangelog } from "../libs/api/package";
import { buildCsvAttachment, handler } from "./runAttachmentArchiveIntegrityCheck";

vi.mock("../attachment-archive/backfill", () => ({
  listAllAttachmentArchivePackageIds: vi.fn(),
}));

vi.mock("../libs/api/package", () => ({
  getPackage: vi.fn(),
  getPackageChangelog: vi.fn(),
}));

type S3ObjectStore = Map<string, string>;

function toStoreKey(bucket: string, key: string) {
  return `${bucket}/${key}`;
}

function buildS3GetBody(value: string) {
  return {
    transformToString: async () => value,
  };
}

describe("runAttachmentArchiveIntegrityCheck", () => {
  const listAllAttachmentArchivePackageIdsMock = vi.mocked(listAllAttachmentArchivePackageIds);
  const getPackageChangelogMock = vi.mocked(getPackageChangelog);
  const getPackageMock = vi.mocked(getPackage);
  const s3SendSpy = vi.spyOn(S3Client.prototype, "send");
  const originalBucketName = process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME;
  const originalBaseBucketName = process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME;
  const originalReportPrefix = process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX;
  const originalStageName = process.env.STAGE_NAME;

  beforeEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = "archive-write-bucket";
    process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME = "archive-write-bucket";
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX = "archive-integrity";
    process.env.STAGE_NAME = "main";
    listAllAttachmentArchivePackageIdsMock.mockReset();
    getPackageChangelogMock.mockReset();
    getPackageMock.mockReset();
    s3SendSpy.mockReset();
  });

  afterEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = originalBucketName;
    process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME = originalBaseBucketName;
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX = originalReportPrefix;
    process.env.STAGE_NAME = originalStageName;
  });

  function mockS3({
    objectStore,
    listedKeys,
    existingObjects,
    putStore,
  }: {
    objectStore: S3ObjectStore;
    listedKeys: string[];
    existingObjects: Set<string>;
    putStore: S3ObjectStore;
  }) {
    s3SendSpy.mockImplementation(async (command: any) => {
      const commandName = command.constructor.name;
      const input = command.input;

      if (commandName === "ListObjectsV2Command") {
        const contents = listedKeys
          .filter((key) => key.startsWith(input.Prefix))
          .map((key) => ({ Key: key }));
        return {
          Contents: contents,
          IsTruncated: false,
        } as never;
      }

      if (commandName === "GetObjectCommand") {
        const value = objectStore.get(toStoreKey(input.Bucket, input.Key));
        if (value === undefined) {
          const notFoundError = new Error("Not found");
          (notFoundError as any).name = "NoSuchKey";
          (notFoundError as any).$metadata = { httpStatusCode: 404 };
          throw notFoundError;
        }

        return {
          Body: buildS3GetBody(value),
        } as never;
      }

      if (commandName === "HeadObjectCommand") {
        if (existingObjects.has(toStoreKey(input.Bucket, input.Key))) {
          return {} as never;
        }

        const notFoundError = new Error("Not found");
        (notFoundError as any).name = "NotFound";
        (notFoundError as any).$metadata = { httpStatusCode: 404 };
        throw notFoundError;
      }

      if (commandName === "PutObjectCommand") {
        const body =
          typeof input.Body === "string"
            ? input.Body
            : Buffer.from(input.Body || "").toString("utf8");
        putStore.set(toStoreKey(input.Bucket, input.Key), body);
        return {} as never;
      }

      return {} as never;
    });
  }

  it("builds and truncates csv attachments safely when oversized", () => {
    const discrepancies = Array.from({ length: 50000 }).map((_, index) => ({
      authority: "Medicaid SPA",
      packageId: `MD-${index}`,
      sectionId: `section-${index}`,
      cmsStatus: "Submitted",
      submissionDate: "2026-04-06T00:00:00.000Z",
      issueScope: "Section" as const,
      discrepancyType: "SECTION_FILE_EXTRA",
      expectedValue: "none",
      actualValue: "x".repeat(400),
    }));

    const result = buildCsvAttachment(discrepancies);
    expect(result.truncated).toBe(true);
    expect(result.filename).toBe("discrepancies-truncated.csv");
    expect(result.rowCountIncluded).toBeLessThan(result.rowCountTotal);
    expect(Buffer.byteLength(result.csv, "utf8")).toBeLessThanOrEqual(
      Math.floor(5.5 * 1024 * 1024),
    );
  }, 30000);

  it("detects package and section discrepancies and writes required report fields", async () => {
    const packageId = "MD-1";
    const changelog = [
      {
        _source: {
          id: "s1",
          event: "app-k",
          isAdminChange: false,
          timestamp: 1,
          attachments: [
            {
              bucket: "attachment-bucket",
              key: "a-key",
              filename: "a.pdf",
              title: "A",
            },
          ],
        },
      },
      {
        _source: {
          id: "s2",
          event: "respond-to-rai",
          isAdminChange: false,
          timestamp: 2,
          attachments: [
            {
              bucket: "attachment-bucket",
              key: "b-key",
              filename: "b.pdf",
              title: "B",
            },
          ],
        },
      },
    ] as any;
    listAllAttachmentArchivePackageIdsMock.mockResolvedValue([packageId]);
    getPackageChangelogMock.mockResolvedValue({
      hits: {
        hits: changelog,
      },
    } as any);
    getPackageMock.mockResolvedValue({
      _source: {
        authority: "Medicaid SPA",
        cmsStatus: "Submitted",
        submissionDate: "2026-04-06T00:00:00.000Z",
      },
    } as any);

    const sections = buildAttachmentArchiveSections({ packageId, changelog });
    const section1 = sections[0];
    const section2 = sections[1];
    const expectedSection2Manifest = buildSectionAttachmentArchiveManifest({
      packageId,
      scope: "section",
      sectionId: section2.sectionId,
      sectionNumber: section2.sectionNumber,
      sectionLabel: section2.sectionLabel,
      sectionFolderName: section2.sectionFolderName,
      rootFolderName: section2.rootFolderName,
      attachments: section2.attachments,
    });

    const crossBleedSectionManifest = buildSectionAttachmentArchiveManifest({
      packageId,
      scope: "section",
      sectionId: section1.sectionId,
      sectionNumber: section1.sectionNumber,
      sectionLabel: section1.sectionLabel,
      sectionFolderName: section1.sectionFolderName,
      rootFolderName: section1.rootFolderName,
      attachments: section2.attachments,
    });
    const packageManifest = buildPackageAttachmentArchiveManifest({
      packageId,
      sections: [
        {
          sectionId: section1.sectionId,
          sectionNumber: section1.sectionNumber,
          sectionLabel: section1.sectionLabel,
          sectionFolderName: section1.sectionFolderName,
          rootFolderName: section1.rootFolderName,
          artifactKey: getArchiveArtifactKey(
            {
              packageId,
              scope: "section",
              sectionId: section1.sectionId,
            },
            crossBleedSectionManifest.hash,
          ),
          attachmentCount: crossBleedSectionManifest.attachments.length,
          hash: "section-hash-mismatch",
          manifestKey: getArchiveManifestKey(
            {
              packageId,
              scope: "section",
              sectionId: section1.sectionId,
            },
            crossBleedSectionManifest.hash,
          ),
        },
        {
          sectionId: "s3",
          sectionNumber: 3,
          sectionLabel: "orphan",
          sectionFolderName: "section-3-orphan",
          rootFolderName: "MD-1-section-3-orphan",
          artifactKey: "package/MD-1/section/s3/orphan.zip",
          attachmentCount: 1,
          hash: "orphan-hash",
          manifestKey: "package/MD-1/section/s3/orphan.manifest.json",
        },
      ],
    });

    const section1Current = buildAttachmentArchiveCurrent({
      scope: "section",
      hash: "unexpected-section-hash",
      status: "READY",
      artifactKey: "package/MD-1/section/s1/a.zip",
      manifestKey: "package/MD-1/section/s1/cross-bleed.manifest.json",
      attachmentCount: crossBleedSectionManifest.attachments.length,
      sectionId: section1.sectionId,
      sectionNumber: section1.sectionNumber,
      sectionLabel: section1.sectionLabel,
      sectionFolderName: section1.sectionFolderName,
    });
    const section2Current = buildAttachmentArchiveCurrent({
      scope: "section",
      hash: expectedSection2Manifest.hash,
      status: "READY",
      artifactKey: "package/MD-1/section/s2/a.zip",
      manifestKey: `package/MD-1/section/s2/${expectedSection2Manifest.hash}.manifest.json`,
      attachmentCount: expectedSection2Manifest.attachments.length,
      sectionId: section2.sectionId,
      sectionNumber: section2.sectionNumber,
      sectionLabel: section2.sectionLabel,
      sectionFolderName: section2.sectionFolderName,
    });
    const packageCurrent = buildAttachmentArchiveCurrent({
      scope: "all",
      hash: "unexpected-package-hash",
      status: "READY",
      artifactKey: "package/MD-1/all/package.zip",
      manifestKey: "package/MD-1/all/cross-package.manifest.json",
      attachmentCount: 2,
    });

    const objectStore: S3ObjectStore = new Map([
      [
        toStoreKey(
          "archive-write-bucket",
          getArchiveCurrentKey({ packageId, scope: "section", sectionId: "s1" }),
        ),
        JSON.stringify(section1Current),
      ],
      [
        toStoreKey(
          "archive-write-bucket",
          getArchiveCurrentKey({ packageId, scope: "section", sectionId: "s2" }),
        ),
        JSON.stringify(section2Current),
      ],
      [
        toStoreKey("archive-write-bucket", getArchiveCurrentKey({ packageId, scope: "all" })),
        JSON.stringify(packageCurrent),
      ],
      [
        toStoreKey("archive-write-bucket", "package/MD-1/section/s1/cross-bleed.manifest.json"),
        JSON.stringify(crossBleedSectionManifest),
      ],
      [
        toStoreKey(
          "archive-write-bucket",
          `package/MD-1/section/s2/${expectedSection2Manifest.hash}.manifest.json`,
        ),
        JSON.stringify(expectedSection2Manifest),
      ],
      [
        toStoreKey("archive-write-bucket", "package/MD-1/all/cross-package.manifest.json"),
        JSON.stringify(packageManifest),
      ],
    ]);
    const listedKeys = [
      "package/MD-1/section/s1/current.json",
      "package/MD-1/section/s2/current.json",
      "package/MD-1/all/current.json",
      "package/MD-1/section/s1/a.zip",
      "package/MD-1/section/s1/b.zip",
      "package/MD-1/section/s2/a.zip",
    ];
    const existingObjects = new Set([
      toStoreKey("archive-write-bucket", "package/MD-1/section/s1/a.zip"),
      toStoreKey("archive-write-bucket", "package/MD-1/section/s2/a.zip"),
    ]);
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    const result = await handler();
    expect(result.discrepancyCount).toBeGreaterThan(0);
    expect(result.packagesScanned).toBe(1);
    expect(result.sectionsScanned).toBe(2);

    const summaryEntry = Array.from(putStore.entries()).find(([key]) =>
      key.endsWith("/summary.json"),
    );
    expect(summaryEntry).toBeDefined();
    const summary = JSON.parse(summaryEntry?.[1] || "{}");
    expect(summary.notificationStatus).toBe("PENDING");
    expect(summary.discrepancyCount).toBeGreaterThan(0);
    expect(summary.discrepancyTypeCounts).toEqual(expect.any(Object));

    const discrepancyEntry = Array.from(putStore.entries()).find(([key]) =>
      key.endsWith("/discrepancies.json"),
    );
    const discrepancies = JSON.parse(discrepancyEntry?.[1] || "[]");
    expect(discrepancies).toContainEqual(
      expect.objectContaining({
        discrepancyType: "PACKAGE_FILE_MISSING",
      }),
    );
    expect(discrepancies).toContainEqual(
      expect.objectContaining({
        discrepancyType: "PACKAGE_SECTION_ORPHAN",
      }),
    );
    expect(discrepancies).toContainEqual(
      expect.objectContaining({
        discrepancyType: "SECTION_CROSS_SECTION_BLEED",
      }),
    );
    expect(discrepancies).toContainEqual(
      expect.objectContaining({
        discrepancyType: "SECTION_ZIP_COUNT_MISMATCH",
      }),
    );
    const first = discrepancies[0];
    expect(first).toEqual(
      expect.objectContaining({
        authority: expect.any(String),
        packageId: expect.any(String),
        sectionId: expect.any(String),
        cmsStatus: expect.any(String),
        submissionDate: expect.any(String),
        issueScope: expect.any(String),
        discrepancyType: expect.any(String),
        expectedValue: expect.any(String),
        actualValue: expect.any(String),
      }),
    );

    const csvEntry = Array.from(putStore.entries()).find(([key]) => key.endsWith(".csv"));
    expect(csvEntry?.[1]).toContain(
      "authority,packageId,sectionId,cmsStatus,submissionDate,issueScope,discrepancyType,expectedValue,actualValue",
    );
  });

  it("writes a successful summary with skipped notification when no discrepancies are found", async () => {
    const packageId = "MD-2";
    const changelog = [
      {
        _source: {
          id: "s1",
          event: "app-k",
          isAdminChange: false,
          timestamp: 1,
          attachments: [
            {
              bucket: "attachment-bucket",
              key: "a-key",
              filename: "a.pdf",
              title: "A",
            },
          ],
        },
      },
    ] as any;
    listAllAttachmentArchivePackageIdsMock.mockResolvedValue([packageId]);
    getPackageChangelogMock.mockResolvedValue({
      hits: {
        hits: changelog,
      },
    } as any);
    getPackageMock.mockResolvedValue({
      _source: {
        authority: "Medicaid SPA",
        cmsStatus: "Submitted",
        submissionDate: "2026-04-06T00:00:00.000Z",
      },
    } as any);

    const section = buildAttachmentArchiveSections({ packageId, changelog })[0];
    const sectionManifest = buildSectionAttachmentArchiveManifest({
      packageId,
      scope: "section",
      sectionId: section.sectionId,
      sectionNumber: section.sectionNumber,
      sectionLabel: section.sectionLabel,
      sectionFolderName: section.sectionFolderName,
      rootFolderName: section.rootFolderName,
      attachments: section.attachments,
    });
    const packageManifest = buildPackageAttachmentArchiveManifest({
      packageId,
      sections: [
        {
          sectionId: section.sectionId,
          sectionNumber: section.sectionNumber,
          sectionLabel: section.sectionLabel,
          sectionFolderName: section.sectionFolderName,
          rootFolderName: section.rootFolderName,
          artifactKey: getArchiveArtifactKey(
            {
              packageId,
              scope: "section",
              sectionId: section.sectionId,
            },
            sectionManifest.hash,
          ),
          attachmentCount: sectionManifest.attachments.length,
          hash: sectionManifest.hash,
          manifestKey: getArchiveManifestKey(
            {
              packageId,
              scope: "section",
              sectionId: section.sectionId,
            },
            sectionManifest.hash,
          ),
        },
      ],
    });

    const sectionCurrent = buildAttachmentArchiveCurrent({
      scope: "section",
      hash: sectionManifest.hash,
      status: "READY",
      artifactKey: `package/${packageId}/section/${section.sectionId}/${sectionManifest.hash}.zip`,
      manifestKey: `package/${packageId}/section/${section.sectionId}/${sectionManifest.hash}.manifest.json`,
      attachmentCount: sectionManifest.attachments.length,
      sectionId: section.sectionId,
      sectionNumber: section.sectionNumber,
      sectionLabel: section.sectionLabel,
      sectionFolderName: section.sectionFolderName,
    });
    const packageCurrent = buildAttachmentArchiveCurrent({
      scope: "all",
      hash: packageManifest.hash,
      status: "READY",
      artifactKey: `package/${packageId}/all/${packageManifest.hash}.zip`,
      manifestKey: `package/${packageId}/all/${packageManifest.hash}.manifest.json`,
      attachmentCount: sectionManifest.attachments.length,
    });

    const objectStore: S3ObjectStore = new Map([
      [
        toStoreKey(
          "archive-write-bucket",
          getArchiveCurrentKey({ packageId, scope: "section", sectionId: section.sectionId }),
        ),
        JSON.stringify(sectionCurrent),
      ],
      [
        toStoreKey("archive-write-bucket", getArchiveCurrentKey({ packageId, scope: "all" })),
        JSON.stringify(packageCurrent),
      ],
      [
        toStoreKey(
          "archive-write-bucket",
          `package/${packageId}/section/${section.sectionId}/${sectionManifest.hash}.manifest.json`,
        ),
        JSON.stringify(sectionManifest),
      ],
      [
        toStoreKey(
          "archive-write-bucket",
          `package/${packageId}/all/${packageManifest.hash}.manifest.json`,
        ),
        JSON.stringify(packageManifest),
      ],
    ]);
    const listedKeys = [
      `package/${packageId}/section/${section.sectionId}/current.json`,
      `package/${packageId}/all/current.json`,
      `package/${packageId}/section/${section.sectionId}/${sectionManifest.hash}.zip`,
    ];
    const existingObjects = new Set([
      toStoreKey(
        "archive-write-bucket",
        `package/${packageId}/section/${section.sectionId}/${sectionManifest.hash}.zip`,
      ),
      toStoreKey("archive-write-bucket", `package/${packageId}/all/${packageManifest.hash}.zip`),
    ]);
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    const result = await handler();
    expect(result.discrepancyCount).toBe(0);

    const summaryEntry = Array.from(putStore.entries()).find(([key]) =>
      key.endsWith("/summary.json"),
    );
    const summary = JSON.parse(summaryEntry?.[1] || "{}");
    expect(summary.status).toBe("SUCCESS");
    expect(summary.notificationStatus).toBe("SKIPPED");
    expect(summary.discrepancyCount).toBe(0);
  });

  it("persists a failed summary and throws when processing fails", async () => {
    listAllAttachmentArchivePackageIdsMock.mockResolvedValue(["MD-3"]);
    getPackageChangelogMock.mockRejectedValue(new Error("OpenSearch unavailable"));

    const objectStore: S3ObjectStore = new Map();
    const listedKeys: string[] = [];
    const existingObjects = new Set<string>();
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    await expect(handler()).rejects.toThrow("summaryKey");

    const summaryEntry = Array.from(putStore.entries()).find(([key]) =>
      key.endsWith("/summary.json"),
    );
    expect(summaryEntry).toBeDefined();
    const summary = JSON.parse(summaryEntry?.[1] || "{}");
    expect(summary.status).toBe("FAILED");
    expect(summary.notificationStatus).toBe("PENDING");
    expect(summary.errorMessage).toContain("OpenSearch unavailable");
  });
});
