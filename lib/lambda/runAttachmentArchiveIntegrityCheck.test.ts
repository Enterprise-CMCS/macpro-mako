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

vi.mock("../attachment-archive/backfill", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../attachment-archive/backfill")>();
  return {
    ...actual,
    listAllAttachmentArchivePackageIds: vi.fn(),
  };
});

vi.mock("../libs/api/package", () => ({
  getPackage: vi.fn(),
  getPackageChangelog: vi.fn(),
}));

type S3ObjectStore = Map<string, string>;

type PackageFixture = {
  packageId: string;
  changelog: any[];
  packageItem: any;
  objectEntries: Array<[string, string]>;
  listedKeys: string[];
  existingObjects: string[];
};

function toStoreKey(bucket: string, key: string) {
  return `${bucket}/${key}`;
}

function buildS3GetBody(value: string) {
  return {
    transformToString: async () => value,
  };
}

function buildValidPackageFixture(packageId: string): PackageFixture {
  const changelog = [
    {
      _source: {
        id: `${packageId}-s1`,
        event: "app-k",
        isAdminChange: false,
        timestamp: 1,
        attachments: [
          {
            bucket: "attachment-bucket",
            key: `${packageId}-a-key`,
            filename: `${packageId}.pdf`,
            title: "A",
          },
        ],
      },
    },
  ] as any[];
  const packageItem = {
    _source: {
      authority: "Medicaid SPA",
      cmsStatus: "Submitted",
      submissionDate: "2026-04-06T00:00:00.000Z",
    },
  };

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

  const sectionArtifactKey = `package/${packageId}/section/${section.sectionId}/${sectionManifest.hash}.zip`;
  const sectionManifestKey = `package/${packageId}/section/${section.sectionId}/${sectionManifest.hash}.manifest.json`;
  const packageArtifactKey = `package/${packageId}/all/${packageManifest.hash}.zip`;
  const packageManifestKey = `package/${packageId}/all/${packageManifest.hash}.manifest.json`;
  const sectionCurrent = buildAttachmentArchiveCurrent({
    scope: "section",
    hash: sectionManifest.hash,
    status: "READY",
    artifactKey: sectionArtifactKey,
    manifestKey: sectionManifestKey,
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
    artifactKey: packageArtifactKey,
    manifestKey: packageManifestKey,
    attachmentCount: sectionManifest.attachments.length,
  });

  return {
    packageId,
    changelog,
    packageItem,
    objectEntries: [
      [
        getArchiveCurrentKey({ packageId, scope: "section", sectionId: section.sectionId }),
        JSON.stringify(sectionCurrent),
      ],
      [getArchiveCurrentKey({ packageId, scope: "all" }), JSON.stringify(packageCurrent)],
      [sectionManifestKey, JSON.stringify(sectionManifest)],
      [packageManifestKey, JSON.stringify(packageManifest)],
    ],
    listedKeys: [
      `package/${packageId}/section/${section.sectionId}/current.json`,
      `package/${packageId}/all/current.json`,
      sectionArtifactKey,
    ],
    existingObjects: [sectionArtifactKey, packageArtifactKey],
  };
}

function buildFailedTerminalFixture(packageId: string): PackageFixture {
  const fixture = buildValidPackageFixture(packageId);
  fixture.objectEntries = fixture.objectEntries.map(([key, value]) => {
    if (!key.endsWith("/current.json")) {
      return [key, value];
    }

    const current = JSON.parse(value);
    return [
      key,
      JSON.stringify({
        ...current,
        status: "FAILED",
        failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
        failureMessage: "Attachments are no longer available.",
      }),
    ];
  });
  fixture.existingObjects = [];
  return fixture;
}

function createPackageMocks(fixtures: PackageFixture[]) {
  const fixtureMap = new Map(fixtures.map((fixture) => [fixture.packageId, fixture]));
  vi.mocked(getPackageChangelog).mockImplementation(async (packageId: string) => {
    const fixture = fixtureMap.get(packageId);
    if (!fixture) {
      throw new Error(`Unexpected package ${packageId}`);
    }
    return {
      hits: {
        hits: fixture.changelog,
      },
    } as any;
  });
  vi.mocked(getPackage).mockImplementation(async (packageId: string) => {
    const fixture = fixtureMap.get(packageId);
    if (!fixture) {
      throw new Error(`Unexpected package ${packageId}`);
    }
    return fixture.packageItem as any;
  });
}

function buildArchiveStores(fixtures: PackageFixture[]) {
  const objectStore: S3ObjectStore = new Map();
  const listedKeys: string[] = [];
  const existingObjects = new Set<string>();

  for (const fixture of fixtures) {
    for (const [key, value] of fixture.objectEntries) {
      objectStore.set(toStoreKey("archive-write-bucket", key), value);
    }
    listedKeys.push(...fixture.listedKeys);
    for (const key of fixture.existingObjects) {
      existingObjects.add(toStoreKey("archive-write-bucket", key));
    }
  }

  return {
    objectStore,
    listedKeys,
    existingObjects,
  };
}

describe("runAttachmentArchiveIntegrityCheck", () => {
  const listAllAttachmentArchivePackageIdsMock = vi.mocked(listAllAttachmentArchivePackageIds);
  const getPackageChangelogMock = vi.mocked(getPackageChangelog);
  const s3SendSpy = vi.spyOn(S3Client.prototype, "send");
  const originalBucketName = process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME;
  const originalBaseBucketName = process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME;
  const originalExceptionRegistryKey = process.env.ATTACHMENT_ARCHIVE_INTEGRITY_EXCEPTION_KEY;
  const originalReportPrefix = process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX;
  const originalStageName = process.env.STAGE_NAME;

  beforeEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = "archive-write-bucket";
    process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME = "archive-write-bucket";
    delete process.env.ATTACHMENT_ARCHIVE_INTEGRITY_EXCEPTION_KEY;
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX = "archive-integrity";
    process.env.STAGE_NAME = "main";
    listAllAttachmentArchivePackageIdsMock.mockReset();
    vi.mocked(getPackage).mockReset();
    getPackageChangelogMock.mockReset();
    s3SendSpy.mockReset();
  });

  afterEach(() => {
    process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME = originalBucketName;
    process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME = originalBaseBucketName;
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_EXCEPTION_KEY = originalExceptionRegistryKey;
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
        const dynamicKeys = Array.from(objectStore.keys())
          .filter((key) => key.startsWith(`${input.Bucket}/`))
          .map((key) => key.slice(input.Bucket.length + 1));
        const keys = Array.from(new Set([...listedKeys, ...dynamicKeys]))
          .filter((key) => key.startsWith(input.Prefix || ""))
          .sort();
        return {
          Contents: keys.map((key) => ({ Key: key })),
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
        const storeKey = toStoreKey(input.Bucket, input.Key);
        putStore.set(storeKey, body);
        objectStore.set(storeKey, body);
        return {} as never;
      }

      return {} as never;
    });
  }

  function findStoredJson(store: S3ObjectStore, suffix: string) {
    const entry = Array.from(store.entries()).find(([key]) => key.endsWith(suffix));
    expect(entry).toBeDefined();
    return JSON.parse(entry?.[1] || "{}");
  }

  it("throws when STAGE_NAME is missing", async () => {
    delete process.env.STAGE_NAME;

    await expect(handler()).rejects.toThrow(
      "ATTACHMENT_ARCHIVE_INTEGRITY_STAGE_NAME must be defined via STAGE_NAME",
    );
  });

  it("throws when STAGE_NAME is blank", async () => {
    process.env.STAGE_NAME = "   ";

    await expect(handler()).rejects.toThrow(
      "ATTACHMENT_ARCHIVE_INTEGRITY_STAGE_NAME must be defined via STAGE_NAME",
    );
  });

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
  }, 120000);

  it("excludes soft-deleted package ids from integrity scans", async () => {
    listAllAttachmentArchivePackageIdsMock.mockResolvedValue(["MD-1", "MD-2-del", "MD-3"]);
    createPackageMocks([buildValidPackageFixture("MD-1"), buildValidPackageFixture("MD-3")]);

    const { objectStore, listedKeys, existingObjects } = buildArchiveStores([
      buildValidPackageFixture("MD-1"),
      buildValidPackageFixture("MD-3"),
    ]);
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    const result = await handler();
    expect(result.status).toBe("COMPLETE");
    expect(result.packagesTotal).toBe(2);
    expect(findStoredJson(objectStore, "/package-ids.json")).toEqual(["MD-1", "MD-3"]);
    expect(findStoredJson(objectStore, "/summary.json").skippedDeletedPackageCount).toBe(1);
    expect(getPackageChangelogMock).toHaveBeenCalledTimes(2);
  });

  it("creates checkpoint files on the first invocation and resumes to completion", async () => {
    const fixtures = [buildValidPackageFixture("MD-1"), buildValidPackageFixture("MD-2")];
    listAllAttachmentArchivePackageIdsMock.mockResolvedValue(
      fixtures.map((fixture) => fixture.packageId),
    );
    createPackageMocks(fixtures);

    const { objectStore, listedKeys, existingObjects } = buildArchiveStores(fixtures);
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    const remainingTimes = [60000];
    const firstResult = await handler(
      {},
      {
        getRemainingTimeInMillis: () => remainingTimes.shift() ?? 60000,
      },
    );

    expect(firstResult.status).toBe("IN_PROGRESS");
    expect(firstResult.packagesScanned).toBe(1);
    expect(firstResult.packagesTotal).toBe(2);
    expect(firstResult.summaryKey).toContain("/summary.json");
    expect(firstResult.checkpointKey).toContain("/checkpoint.json");

    const initialSummary = findStoredJson(putStore, "/summary.json");
    expect(initialSummary.status).toBe("RUNNING");
    expect(initialSummary.packagesScanned).toBe(1);
    expect(initialSummary.packagesTotal).toBe(2);
    expect(initialSummary.lastProcessedPackageId).toBe("MD-1");
    expect(initialSummary.checkpointKey).toBe(firstResult.checkpointKey);
    expect(findStoredJson(putStore, "/checkpoint.json")).toEqual(
      expect.objectContaining({
        nextPackageIndex: 1,
        packagesScanned: 1,
        packagesTotal: 2,
        lastProcessedPackageId: "MD-1",
      }),
    );
    expect(findStoredJson(putStore, "/package-ids.json")).toEqual(["MD-1", "MD-2"]);

    const resumedResult = await handler(firstResult);
    expect(resumedResult.status).toBe("COMPLETE");
    expect(resumedResult.packagesScanned).toBe(2);
    expect(resumedResult.packagesTotal).toBe(2);
    expect(listAllAttachmentArchivePackageIdsMock).toHaveBeenCalledTimes(1);

    const finalSummary = findStoredJson(objectStore, "/summary.json");
    expect(finalSummary.status).toBe("SUCCESS");
    expect(finalSummary.notificationStatus).toBe("SKIPPED");
    expect(finalSummary.packagesScanned).toBe(2);
    expect(finalSummary.discrepancyCount).toBe(0);
    expect(finalSummary.discrepancyJsonKey).toContain("/discrepancies.json");
  });

  it("writes final discrepancy artifacts when the run completes with mismatches", async () => {
    const fixture = buildValidPackageFixture("MD-3");
    fixture.objectEntries = fixture.objectEntries.filter(
      ([key]) => key !== getArchiveCurrentKey({ packageId: fixture.packageId, scope: "all" }),
    );
    fixture.listedKeys = fixture.listedKeys.filter((key) => !key.endsWith("/all/current.json"));

    listAllAttachmentArchivePackageIdsMock.mockResolvedValue([fixture.packageId]);
    createPackageMocks([fixture]);

    const { objectStore, listedKeys, existingObjects } = buildArchiveStores([fixture]);
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    const result = await handler();
    expect(result.status).toBe("COMPLETE");
    expect(result.discrepancyCount).toBeGreaterThan(0);

    const summary = findStoredJson(objectStore, "/summary.json");
    expect(summary.status).toBe("SUCCESS");
    expect(summary.notificationStatus).toBe("PENDING");
    expect(summary.packagesTotal).toBe(1);
    expect(summary.checkpointKey).toContain("/checkpoint.json");

    const discrepancies = findStoredJson(objectStore, "/discrepancies.json");
    expect(discrepancies).toContainEqual(
      expect.objectContaining({
        discrepancyType: "PACKAGE_CURRENT_MISSING",
      }),
    );
    const csvEntry = Array.from(objectStore.entries()).find(([key]) => key.endsWith(".csv"));
    expect(csvEntry?.[1]).toContain(
      "authority,packageId,sectionId,cmsStatus,submissionDate,issueScope,discrepancyType,expectedValue,actualValue",
    );
  });

  it("suppresses dependent package discrepancies when package archive is not ready", async () => {
    const fixture = buildFailedTerminalFixture("MD-7");
    listAllAttachmentArchivePackageIdsMock.mockResolvedValue([fixture.packageId]);
    createPackageMocks([fixture]);

    const { objectStore, listedKeys, existingObjects } = buildArchiveStores([fixture]);
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    const result = await handler();
    expect(result.status).toBe("COMPLETE");
    const discrepancies = findStoredJson(objectStore, "/discrepancies.json");
    expect(discrepancies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          discrepancyType: "PACKAGE_NOT_READY",
        }),
      ]),
    );
    expect(discrepancies).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          discrepancyType: "PACKAGE_ZIP_MISSING",
        }),
      ]),
    );
  });

  it("moves matching terminal failures into exception artifacts", async () => {
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_EXCEPTION_KEY =
      "archive-integrity/val/exception-registry.json";
    const fixture = buildFailedTerminalFixture("MD-6");
    const sectionId = buildAttachmentArchiveSections({
      packageId: fixture.packageId,
      changelog: fixture.changelog,
    })[0].sectionId;
    listAllAttachmentArchivePackageIdsMock.mockResolvedValue([fixture.packageId]);
    createPackageMocks([fixture]);

    const { objectStore, listedKeys, existingObjects } = buildArchiveStores([fixture]);
    objectStore.set(
      toStoreKey("archive-write-bucket", "archive-integrity/val/exception-registry.json"),
      JSON.stringify([
        {
          packageId: fixture.packageId,
          scope: "all",
          failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
          reason: "Known terminal package failure",
          addedAt: "2026-04-20T00:00:00.000Z",
        },
        {
          packageId: fixture.packageId,
          scope: "section",
          sectionId,
          failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
          reason: "Known terminal section failure",
          addedAt: "2026-04-20T00:00:00.000Z",
        },
      ]),
    );
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    const result = await handler();

    expect(result.status).toBe("COMPLETE");
    expect(result.discrepancyCount).toBe(0);
    expect(result.exceptionCount).toBe(2);
    const summary = findStoredJson(objectStore, "/summary.json");
    expect(summary.exceptionCount).toBe(2);
    expect(summary.discrepancyCount).toBe(0);
    expect(summary.exceptionJsonKey).toContain("/exceptions.json");
    const exceptions = findStoredJson(objectStore, "/exceptions.json");
    expect(exceptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          packageId: "MD-6",
          failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
          issueScope: "Download All",
        }),
        expect.objectContaining({
          packageId: "MD-6",
          sectionId,
          failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
          issueScope: "Section",
        }),
      ]),
    );
  });

  it("keeps missing current discrepancies actionable even when an exception registry is configured", async () => {
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_EXCEPTION_KEY =
      "archive-integrity/val/exception-registry.json";
    const fixture = buildValidPackageFixture("MD-7");
    fixture.objectEntries = fixture.objectEntries.filter(
      ([key]) => key !== getArchiveCurrentKey({ packageId: fixture.packageId, scope: "all" }),
    );
    fixture.listedKeys = fixture.listedKeys.filter((key) => !key.endsWith("/all/current.json"));
    listAllAttachmentArchivePackageIdsMock.mockResolvedValue([fixture.packageId]);
    createPackageMocks([fixture]);

    const { objectStore, listedKeys, existingObjects } = buildArchiveStores([fixture]);
    objectStore.set(
      toStoreKey("archive-write-bucket", "archive-integrity/val/exception-registry.json"),
      JSON.stringify([
        {
          packageId: fixture.packageId,
          scope: "all",
          failureCode: "ALL_ATTACHMENTS_UNAVAILABLE",
          reason: "Would match if current existed",
          addedAt: "2026-04-20T00:00:00.000Z",
        },
      ]),
    );
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    const result = await handler();

    expect(result.status).toBe("COMPLETE");
    expect(result.discrepancyCount).toBeGreaterThan(0);
    expect(result.exceptionCount).toBe(0);
    const discrepancies = findStoredJson(objectStore, "/discrepancies.json");
    expect(discrepancies).toContainEqual(
      expect.objectContaining({
        discrepancyType: "PACKAGE_CURRENT_MISSING",
      }),
    );
  });

  it("preserves completed progress in the failed summary when a resumed run errors", async () => {
    const fixtures = [buildValidPackageFixture("MD-4"), buildValidPackageFixture("MD-5")];
    listAllAttachmentArchivePackageIdsMock.mockResolvedValue(
      fixtures.map((fixture) => fixture.packageId),
    );
    createPackageMocks(fixtures);
    getPackageChangelogMock.mockImplementation(async (packageId: string) => {
      if (packageId === "MD-5") {
        throw new Error("OpenSearch unavailable");
      }
      const fixture = fixtures.find((entry) => entry.packageId === packageId);
      return {
        hits: {
          hits: fixture?.changelog || [],
        },
      } as any;
    });

    const { objectStore, listedKeys, existingObjects } = buildArchiveStores(fixtures);
    const putStore: S3ObjectStore = new Map();
    mockS3({
      objectStore,
      listedKeys,
      existingObjects,
      putStore,
    });

    const remainingTimes = [60000];
    const firstResult = await handler(
      {},
      {
        getRemainingTimeInMillis: () => remainingTimes.shift() ?? 60000,
      },
    );
    expect(firstResult.status).toBe("IN_PROGRESS");

    await expect(handler(firstResult)).rejects.toThrow("summaryKey");

    const failureSummary = findStoredJson(objectStore, "/summary.json");
    expect(failureSummary.status).toBe("FAILED");
    expect(failureSummary.packagesScanned).toBe(1);
    expect(failureSummary.packagesTotal).toBe(2);
    expect(failureSummary.lastProcessedPackageId).toBe("MD-4");
    expect(failureSummary.errorMessage).toContain("OpenSearch unavailable");
  });
});
