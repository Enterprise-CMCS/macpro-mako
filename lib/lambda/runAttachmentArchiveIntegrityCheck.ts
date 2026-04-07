import {
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { opensearch } from "shared-types";

import {
  buildPackageAttachmentArchiveManifest,
  buildSectionAttachmentArchiveManifest,
  getArchiveArtifactKey,
  getArchiveCurrentKey,
  getArchiveManifestKey,
  parseAttachmentArchiveCurrent,
} from "../attachment-archive/archive-manifest";
import { listAllAttachmentArchivePackageIds } from "../attachment-archive/backfill";
import {
  AttachmentArchiveIntegrityDiscrepancy,
  AttachmentArchiveIntegrityRunResult,
  AttachmentArchiveIntegrityRunSummary,
} from "../attachment-archive/integrity-types";
import { buildAttachmentArchiveSections } from "../attachment-archive/package-activity";
import {
  getJsonObject,
  getObjectText,
  objectExists,
  putJsonObject,
} from "../attachment-archive/storage";
import {
  AttachmentArchiveCurrent,
  AttachmentArchivePackageManifest,
  AttachmentArchiveSectionManifest,
} from "../attachment-archive/types";
import { getPackage, getPackageChangelog } from "../libs/api/package";

const REPORT_FULL_CSV_MAX_BYTES = 6 * 1024 * 1024;
const REPORT_TRUNCATED_CSV_MAX_BYTES = Math.floor(5.5 * 1024 * 1024);
const MAX_VALUE_SAMPLES = 25;
const MAX_TYPE_SUMMARY = 10;
const awsRegion = process.env.region || process.env.AWS_REGION;
const archiveBucketClient = new S3Client({ region: awsRegion });

type ArchiveStorageConfig = {
  writeBucketName: string;
  baseBucketName: string;
  keyPrefix: string;
  reportPrefix: string;
  stage: string;
};

type PackageMetadata = {
  authority: string;
  cmsStatus: string;
  submissionDate: string;
};

type PackageEvaluationContext = {
  packageId: string;
  metadata: PackageMetadata;
  changelog: opensearch.changelog.ItemResult[];
};

type ManifestLookupResult<TManifest> = {
  bucketName: string;
  key: string;
  manifest: TManifest;
};

type CsvAttachmentBuildResult = {
  csv: string;
  truncated: boolean;
  rowCountIncluded: number;
  rowCountTotal: number;
  filename: string;
};

const DISCREPANCY_CSV_COLUMNS: Array<keyof AttachmentArchiveIntegrityDiscrepancy> = [
  "authority",
  "packageId",
  "sectionId",
  "cmsStatus",
  "submissionDate",
  "issueScope",
  "discrepancyType",
  "expectedValue",
  "actualValue",
];

function getStorageConfig(): ArchiveStorageConfig {
  const writeBucketName = process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME;
  if (!writeBucketName) {
    throw new Error("ATTACHMENT_ARCHIVE_BUCKET_NAME must be defined");
  }

  const baseBucketName = process.env.ATTACHMENT_ARCHIVE_BASE_BUCKET_NAME || writeBucketName;
  const keyPrefix = (process.env.ATTACHMENT_ARCHIVE_KEY_PREFIX || "").replace(/^\/+|\/+$/g, "");
  const reportPrefix = (
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX || "archive-integrity"
  ).replace(/^\/+|\/+$/g, "");
  const stage = (process.env.STAGE_NAME || process.env.stage || "unknown").trim();

  return {
    writeBucketName,
    baseBucketName,
    keyPrefix,
    reportPrefix,
    stage,
  };
}

function applyArchiveKeyPrefix(key: string, keyPrefix: string) {
  return keyPrefix ? `${keyPrefix}/${key}` : key;
}

function removeArchiveKeyPrefix(key: string, keyPrefix: string) {
  if (!keyPrefix) {
    return key;
  }

  const expectedPrefix = `${keyPrefix}/`;
  return key.startsWith(expectedPrefix) ? key.slice(expectedPrefix.length) : key;
}

function decodeArchivePathComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function toErrorMessage(error: unknown) {
  if (!error) {
    return "Unknown integrity check error";
  }

  if (error instanceof Error) {
    return error.message || error.name;
  }

  return String(error);
}

function formatIsoDate(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  return "";
}

function getPackageMetadata(item: opensearch.main.ItemResult | undefined): PackageMetadata {
  return {
    authority: String(item?._source?.authority || ""),
    cmsStatus: String(item?._source?.cmsStatus || ""),
    submissionDate: formatIsoDate(item?._source?.submissionDate),
  };
}

function toAttachmentId({
  bucket,
  key,
  filename,
}: {
  bucket: string;
  key: string;
  filename: string;
}) {
  return `${bucket}::${key}::${filename}`;
}

function stringifySampledValue(values: string[]) {
  const uniqueValues = Array.from(new Set(values));
  return JSON.stringify({
    count: uniqueValues.length,
    samples: uniqueValues.slice(0, MAX_VALUE_SAMPLES),
  });
}

function stringifySampleMap(values: Record<string, string[]>) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(values).map(([key, entries]) => [
        key,
        {
          count: entries.length,
          samples: entries.slice(0, MAX_VALUE_SAMPLES),
        },
      ]),
    ),
  );
}

function buildDiscrepancy({
  packageContext,
  sectionId,
  issueScope,
  discrepancyType,
  expectedValue,
  actualValue,
}: {
  packageContext: PackageEvaluationContext;
  sectionId?: string;
  issueScope: "Download All" | "Section";
  discrepancyType: string;
  expectedValue: string;
  actualValue: string;
}): AttachmentArchiveIntegrityDiscrepancy {
  return {
    authority: packageContext.metadata.authority,
    packageId: packageContext.packageId,
    sectionId: sectionId || "",
    cmsStatus: packageContext.metadata.cmsStatus,
    submissionDate: packageContext.metadata.submissionDate,
    issueScope,
    discrepancyType,
    expectedValue,
    actualValue,
  };
}

function isSectionManifest(value: unknown): value is AttachmentArchiveSectionManifest {
  const candidate = value as Partial<AttachmentArchiveSectionManifest> | undefined;
  return Boolean(
    candidate &&
      candidate.type === "section" &&
      candidate.scope === "section" &&
      Array.isArray(candidate.attachments),
  );
}

function isPackageManifest(value: unknown): value is AttachmentArchivePackageManifest {
  const candidate = value as Partial<AttachmentArchivePackageManifest> | undefined;
  return Boolean(
    candidate &&
      candidate.type === "package" &&
      candidate.scope === "all" &&
      Array.isArray(candidate.sections),
  );
}

async function listKeys({ bucket, prefix }: { bucket: string; prefix: string }) {
  const keys = new Set<string>();
  let continuationToken: string | undefined;

  do {
    const response = (await archiveBucketClient.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        Prefix: prefix,
      }),
    )) as ListObjectsV2CommandOutput;

    for (const object of response.Contents || []) {
      if (object.Key) {
        keys.add(object.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return Array.from(keys);
}

async function listPackageArchiveKeys({
  packageId,
  storage,
}: {
  packageId: string;
  storage: ArchiveStorageConfig;
}) {
  const normalizedPackageId = encodeURIComponent(packageId);
  const normalizedKeys = new Set<string>();
  const packagePrefix = `package/${normalizedPackageId}/`;

  const writeKeys = await listKeys({
    bucket: storage.writeBucketName,
    prefix: applyArchiveKeyPrefix(packagePrefix, storage.keyPrefix),
  });

  for (const key of writeKeys) {
    normalizedKeys.add(removeArchiveKeyPrefix(key, storage.keyPrefix));
  }

  if (storage.baseBucketName !== storage.writeBucketName || storage.keyPrefix) {
    const baseKeys = await listKeys({
      bucket: storage.baseBucketName,
      prefix: packagePrefix,
    });
    for (const key of baseKeys) {
      normalizedKeys.add(key);
    }
  }

  return Array.from(normalizedKeys).sort();
}

async function getCurrentState({
  storage,
  currentKey,
}: {
  storage: ArchiveStorageConfig;
  currentKey: string;
}): Promise<{ bucketName: string; current: AttachmentArchiveCurrent } | undefined> {
  const writeCurrentRaw = await getObjectText({
    client: archiveBucketClient,
    bucket: storage.writeBucketName,
    key: applyArchiveKeyPrefix(currentKey, storage.keyPrefix),
  });
  const writeCurrent = parseAttachmentArchiveCurrent(writeCurrentRaw);
  if (writeCurrent) {
    return { bucketName: storage.writeBucketName, current: writeCurrent };
  }

  if (storage.baseBucketName === storage.writeBucketName && !storage.keyPrefix) {
    return undefined;
  }

  const baseCurrentRaw = await getObjectText({
    client: archiveBucketClient,
    bucket: storage.baseBucketName,
    key: currentKey,
  });
  const baseCurrent = parseAttachmentArchiveCurrent(baseCurrentRaw);
  if (!baseCurrent) {
    return undefined;
  }

  return { bucketName: storage.baseBucketName, current: baseCurrent };
}

function buildManifestReadCandidates({
  storage,
  key,
  preferredBucketName,
}: {
  storage: ArchiveStorageConfig;
  key: string;
  preferredBucketName?: string;
}) {
  const normalizedKey = removeArchiveKeyPrefix(key, storage.keyPrefix);
  const prefixedKey = applyArchiveKeyPrefix(normalizedKey, storage.keyPrefix);
  const candidates: Array<{ bucketName: string; key: string }> = [];
  const pushCandidate = (bucketName: string, candidateKey: string) => {
    if (!candidateKey) {
      return;
    }

    const duplicate = candidates.some(
      (candidate) => candidate.bucketName === bucketName && candidate.key === candidateKey,
    );
    if (!duplicate) {
      candidates.push({ bucketName, key: candidateKey });
    }
  };

  if (preferredBucketName) {
    pushCandidate(preferredBucketName, key);
  }

  pushCandidate(storage.writeBucketName, key);
  pushCandidate(storage.writeBucketName, prefixedKey);
  pushCandidate(storage.writeBucketName, normalizedKey);
  pushCandidate(storage.baseBucketName, key);
  pushCandidate(storage.baseBucketName, normalizedKey);

  return candidates;
}

async function getManifestObject<TManifest>({
  storage,
  key,
  preferredBucketName,
}: {
  storage: ArchiveStorageConfig;
  key: string;
  preferredBucketName?: string;
}): Promise<ManifestLookupResult<TManifest> | undefined> {
  for (const candidate of buildManifestReadCandidates({ storage, key, preferredBucketName })) {
    const manifest = await getJsonObject<TManifest>({
      client: archiveBucketClient,
      bucket: candidate.bucketName,
      key: candidate.key,
    });
    if (manifest) {
      return {
        bucketName: candidate.bucketName,
        key: candidate.key,
        manifest,
      };
    }
  }

  return undefined;
}

async function objectExistsWithFallback({
  storage,
  bucketName,
  key,
}: {
  storage: ArchiveStorageConfig;
  bucketName: string;
  key: string;
}) {
  if (
    await objectExists({
      client: archiveBucketClient,
      bucket: bucketName,
      key,
    })
  ) {
    return true;
  }

  const normalizedKey = removeArchiveKeyPrefix(key, storage.keyPrefix);
  if (
    bucketName !== storage.baseBucketName &&
    (await objectExists({
      client: archiveBucketClient,
      bucket: storage.baseBucketName,
      key: normalizedKey,
    }))
  ) {
    return true;
  }

  return false;
}

function buildCsvRow(row: AttachmentArchiveIntegrityDiscrepancy) {
  return DISCREPANCY_CSV_COLUMNS.map((column) => {
    const value = `${row[column] || ""}`;
    if (value.includes('"') || value.includes(",") || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(",");
}

function buildDiscrepancyCsvContent(discrepancies: AttachmentArchiveIntegrityDiscrepancy[]) {
  const header = DISCREPANCY_CSV_COLUMNS.join(",");
  const rows = discrepancies.map(buildCsvRow);
  return [header, ...rows].join("\n");
}

export function buildCsvAttachment(
  discrepancies: AttachmentArchiveIntegrityDiscrepancy[],
): CsvAttachmentBuildResult {
  const fullCsv = buildDiscrepancyCsvContent(discrepancies);
  if (Buffer.byteLength(fullCsv, "utf8") <= REPORT_FULL_CSV_MAX_BYTES) {
    return {
      csv: fullCsv,
      truncated: false,
      rowCountIncluded: discrepancies.length,
      rowCountTotal: discrepancies.length,
      filename: "discrepancies.csv",
    };
  }

  const header = DISCREPANCY_CSV_COLUMNS.join(",");
  let csv = header;
  let includedCount = 0;
  for (const row of discrepancies) {
    const nextLine = `\n${buildCsvRow(row)}`;
    if (Buffer.byteLength(`${csv}${nextLine}`, "utf8") > REPORT_TRUNCATED_CSV_MAX_BYTES) {
      break;
    }
    csv += nextLine;
    includedCount += 1;
  }

  return {
    csv,
    truncated: true,
    rowCountIncluded: includedCount,
    rowCountTotal: discrepancies.length,
    filename: "discrepancies-truncated.csv",
  };
}

function buildReportPrefix({
  reportPrefix,
  runTimestamp,
  runId,
  stage,
}: {
  reportPrefix: string;
  runTimestamp: string;
  runId: string;
  stage: string;
}) {
  const date = new Date(runTimestamp);
  const yyyy = date.getUTCFullYear();
  const mm = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getUTCDate()}`.padStart(2, "0");

  return `${reportPrefix}/${stage}/runs/${yyyy}/${mm}/${dd}/${runId}`;
}

function buildDiscrepancyTypeCounts(discrepancies: AttachmentArchiveIntegrityDiscrepancy[]) {
  return discrepancies.reduce<Record<string, number>>((acc, discrepancy) => {
    acc[discrepancy.discrepancyType] = (acc[discrepancy.discrepancyType] || 0) + 1;
    return acc;
  }, {});
}

function buildTopDiscrepancyTypes(typeCounts: Record<string, number>) {
  return Object.entries(typeCounts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, MAX_TYPE_SUMMARY)
    .map(([type, count]) => ({ type, count }));
}

async function buildPackageEvaluationContext(packageId: string): Promise<PackageEvaluationContext> {
  const [changelogResponse, packageItem] = await Promise.all([
    getPackageChangelog(packageId),
    getPackage(packageId),
  ]);

  return {
    packageId,
    metadata: getPackageMetadata(packageItem),
    changelog: changelogResponse.hits.hits as opensearch.changelog.ItemResult[],
  };
}

function buildExpectedFileSectionLookup(
  expectedSectionManifests: Map<string, AttachmentArchiveSectionManifest>,
) {
  const expectedFileToSections = new Map<string, Set<string>>();
  for (const [sectionId, manifest] of expectedSectionManifests.entries()) {
    for (const attachment of manifest.attachments) {
      const identifier = toAttachmentId(attachment);
      if (!expectedFileToSections.has(identifier)) {
        expectedFileToSections.set(identifier, new Set<string>());
      }
      expectedFileToSections.get(identifier)?.add(sectionId);
    }
  }
  return expectedFileToSections;
}

function parseSectionIdFromCurrentKey(key: string) {
  const match = key.match(/^package\/[^/]+\/section\/([^/]+)\/current\.json$/);
  return match ? decodeArchivePathComponent(match[1]) : undefined;
}

function parseSectionIdFromZipKey(key: string) {
  const match = key.match(/^package\/[^/]+\/section\/([^/]+)\/.+\.zip$/);
  return match ? decodeArchivePathComponent(match[1]) : undefined;
}

function createSectionZipCounts(keys: string[]) {
  const zipKeys = keys.filter((key) => key.endsWith(".zip"));
  const sectionZipKeys = new Map<string, string[]>();
  for (const key of zipKeys) {
    const sectionId = parseSectionIdFromZipKey(key);
    if (!sectionId) {
      continue;
    }

    const values = sectionZipKeys.get(sectionId) || [];
    values.push(key);
    sectionZipKeys.set(sectionId, values);
  }

  return sectionZipKeys;
}

async function evaluatePackageDiscrepancies({
  storage,
  packageContext,
}: {
  storage: ArchiveStorageConfig;
  packageContext: PackageEvaluationContext;
}) {
  const discrepancies: AttachmentArchiveIntegrityDiscrepancy[] = [];

  const expectedSections = buildAttachmentArchiveSections({
    packageId: packageContext.packageId,
    changelog: packageContext.changelog,
  });
  const expectedSectionManifests = new Map<string, AttachmentArchiveSectionManifest>();
  for (const section of expectedSections) {
    expectedSectionManifests.set(
      section.sectionId,
      buildSectionAttachmentArchiveManifest({
        packageId: packageContext.packageId,
        scope: "section",
        sectionId: section.sectionId,
        sectionNumber: section.sectionNumber,
        sectionLabel: section.sectionLabel,
        sectionFolderName: section.sectionFolderName,
        rootFolderName: section.rootFolderName,
        attachments: section.attachments,
      }),
    );
  }

  const expectedSectionIds = new Set(expectedSections.map((section) => section.sectionId));
  const expectedFileToSections = buildExpectedFileSectionLookup(expectedSectionManifests);
  const packageKeys = await listPackageArchiveKeys({
    packageId: packageContext.packageId,
    storage,
  });

  const existingSectionCurrentKeys = packageKeys.filter(
    (key) => key.endsWith("/current.json") && key.includes("/section/"),
  );
  const existingSectionIds = new Set(
    existingSectionCurrentKeys
      .map((key) => parseSectionIdFromCurrentKey(key))
      .filter((value): value is string => Boolean(value)),
  );
  const missingSectionIds = Array.from(expectedSectionIds).filter(
    (sectionId) => !existingSectionIds.has(sectionId),
  );
  const orphanSectionIds = Array.from(existingSectionIds).filter(
    (sectionId) => !expectedSectionIds.has(sectionId),
  );

  for (const sectionId of missingSectionIds) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        sectionId,
        issueScope: "Section",
        discrepancyType: "SECTION_CURRENT_MISSING",
        expectedValue: "Expected section archive current.json to exist",
        actualValue: "Missing section archive current.json",
      }),
    );
  }

  for (const sectionId of orphanSectionIds) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        sectionId,
        issueScope: "Section",
        discrepancyType: "SECTION_ORPHAN_CURRENT",
        expectedValue: "No section archive should exist for non-OpenSearch section",
        actualValue: "Found section archive current.json without matching OpenSearch section",
      }),
    );
  }

  const sectionZipCounts = createSectionZipCounts(packageKeys);
  const actualSectionFileSets = new Map<string, Set<string>>();
  const actualSectionManifestById = new Map<string, AttachmentArchiveSectionManifest>();

  for (const sectionId of expectedSectionIds) {
    const sectionCurrentKey = getArchiveCurrentKey({
      packageId: packageContext.packageId,
      scope: "section",
      sectionId,
    });
    const expectedManifest = expectedSectionManifests.get(sectionId);
    if (!expectedManifest) {
      continue;
    }

    const currentState = await getCurrentState({
      storage,
      currentKey: sectionCurrentKey,
    });
    if (!currentState) {
      continue;
    }

    const expectedZipCount = 1;
    const actualZipCount = (sectionZipCounts.get(sectionId) || []).length;
    if (actualZipCount !== expectedZipCount) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId,
          issueScope: "Section",
          discrepancyType: "SECTION_ZIP_COUNT_MISMATCH",
          expectedValue: `${expectedZipCount}`,
          actualValue: `${actualZipCount}`,
        }),
      );
    }

    if (currentState.current.status !== "READY") {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId,
          issueScope: "Section",
          discrepancyType: "SECTION_NOT_READY",
          expectedValue: "READY",
          actualValue: currentState.current.status,
        }),
      );
    }

    if (currentState.current.hash !== expectedManifest.hash) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId,
          issueScope: "Section",
          discrepancyType: "SECTION_HASH_MISMATCH",
          expectedValue: expectedManifest.hash,
          actualValue: currentState.current.hash,
        }),
      );
    }

    if (
      !(await objectExistsWithFallback({
        storage,
        bucketName: currentState.bucketName,
        key: currentState.current.artifactKey,
      }))
    ) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId,
          issueScope: "Section",
          discrepancyType: "SECTION_ZIP_MISSING",
          expectedValue: currentState.current.artifactKey,
          actualValue: "ZIP artifact not found",
        }),
      );
    }

    const sectionManifestResult = await getManifestObject<AttachmentArchiveSectionManifest>({
      storage,
      key: currentState.current.manifestKey,
      preferredBucketName: currentState.bucketName,
    });
    if (!sectionManifestResult || !isSectionManifest(sectionManifestResult.manifest)) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId,
          issueScope: "Section",
          discrepancyType: "SECTION_MANIFEST_INVALID",
          expectedValue: currentState.current.manifestKey,
          actualValue: "Section manifest was missing or invalid",
        }),
      );
      continue;
    }

    actualSectionManifestById.set(sectionId, sectionManifestResult.manifest);
    const expectedFileIds = new Set(
      expectedManifest.attachments.map((attachment) => toAttachmentId(attachment)),
    );
    const actualFileIds = new Set(
      sectionManifestResult.manifest.attachments.map((attachment) => toAttachmentId(attachment)),
    );
    actualSectionFileSets.set(sectionId, actualFileIds);

    const missingSectionFiles = Array.from(expectedFileIds).filter(
      (identifier) => !actualFileIds.has(identifier),
    );
    if (missingSectionFiles.length > 0) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId,
          issueScope: "Section",
          discrepancyType: "SECTION_FILE_MISSING",
          expectedValue: stringifySampledValue(missingSectionFiles),
          actualValue: "Files were missing from section manifest",
        }),
      );
    }

    const extraSectionFiles = Array.from(actualFileIds).filter(
      (identifier) => !expectedFileIds.has(identifier),
    );
    if (extraSectionFiles.length > 0) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId,
          issueScope: "Section",
          discrepancyType: "SECTION_FILE_EXTRA",
          expectedValue: "No extra section files",
          actualValue: stringifySampledValue(extraSectionFiles),
        }),
      );
    }

    const crossSectionBleedMap: Record<string, string[]> = {};
    for (const identifier of extraSectionFiles) {
      const expectedSectionsForFile = expectedFileToSections.get(identifier);
      if (!expectedSectionsForFile || expectedSectionsForFile.has(sectionId)) {
        continue;
      }

      crossSectionBleedMap[identifier] = Array.from(expectedSectionsForFile);
    }

    if (Object.keys(crossSectionBleedMap).length > 0) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId,
          issueScope: "Section",
          discrepancyType: "SECTION_CROSS_SECTION_BLEED",
          expectedValue: "Files should only appear in their matching OpenSearch section",
          actualValue: stringifySampleMap(crossSectionBleedMap),
        }),
      );
    }
  }

  const expectedPackageSections = expectedSections.map((section) => {
    const sectionManifest = expectedSectionManifests.get(
      section.sectionId,
    ) as AttachmentArchiveSectionManifest;
    return {
      sectionId: section.sectionId,
      sectionNumber: section.sectionNumber,
      sectionLabel: section.sectionLabel,
      sectionFolderName: section.sectionFolderName,
      rootFolderName: section.rootFolderName,
      artifactKey: getArchiveArtifactKey(
        {
          packageId: packageContext.packageId,
          scope: "section",
          sectionId: section.sectionId,
        },
        sectionManifest.hash,
      ),
      attachmentCount: sectionManifest.attachments.length,
      hash: sectionManifest.hash,
      manifestKey: getArchiveManifestKey(
        {
          packageId: packageContext.packageId,
          scope: "section",
          sectionId: section.sectionId,
        },
        sectionManifest.hash,
      ),
    };
  });
  const expectedPackageManifest = buildPackageAttachmentArchiveManifest({
    packageId: packageContext.packageId,
    sections: expectedPackageSections,
  });

  const packageCurrentKey = getArchiveCurrentKey({
    packageId: packageContext.packageId,
    scope: "all",
  });
  const packageCurrent = await getCurrentState({
    storage,
    currentKey: packageCurrentKey,
  });

  if (!packageCurrent) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        issueScope: "Download All",
        discrepancyType: "PACKAGE_CURRENT_MISSING",
        expectedValue: "Expected package archive current.json to exist",
        actualValue: "Missing package archive current.json",
      }),
    );
    return {
      discrepancies,
      sectionsScanned: expectedSectionIds.size,
    };
  }

  if (packageCurrent.current.status !== "READY") {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        issueScope: "Download All",
        discrepancyType: "PACKAGE_NOT_READY",
        expectedValue: "READY",
        actualValue: packageCurrent.current.status,
      }),
    );
  }

  if (packageCurrent.current.hash !== expectedPackageManifest.hash) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        issueScope: "Download All",
        discrepancyType: "PACKAGE_HASH_MISMATCH",
        expectedValue: expectedPackageManifest.hash,
        actualValue: packageCurrent.current.hash,
      }),
    );
  }

  if (
    !(await objectExistsWithFallback({
      storage,
      bucketName: packageCurrent.bucketName,
      key: packageCurrent.current.artifactKey,
    }))
  ) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        issueScope: "Download All",
        discrepancyType: "PACKAGE_ZIP_MISSING",
        expectedValue: packageCurrent.current.artifactKey,
        actualValue: "ZIP artifact not found",
      }),
    );
  }

  const packageManifestResult = await getManifestObject<AttachmentArchivePackageManifest>({
    storage,
    key: packageCurrent.current.manifestKey,
    preferredBucketName: packageCurrent.bucketName,
  });
  if (!packageManifestResult || !isPackageManifest(packageManifestResult.manifest)) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        issueScope: "Download All",
        discrepancyType: "PACKAGE_MANIFEST_INVALID",
        expectedValue: packageCurrent.current.manifestKey,
        actualValue: "Package manifest was missing or invalid",
      }),
    );
    return {
      discrepancies,
      sectionsScanned: expectedSectionIds.size,
    };
  }

  const actualPackageManifest = packageManifestResult.manifest;
  const actualSectionIds = new Set(
    actualPackageManifest.sections.map((section) => section.sectionId),
  );
  const missingPackageSections = Array.from(expectedSectionIds).filter(
    (sectionId) => !actualSectionIds.has(sectionId),
  );
  const orphanPackageSections = Array.from(actualSectionIds).filter(
    (sectionId) => !expectedSectionIds.has(sectionId),
  );

  for (const sectionId of missingPackageSections) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        sectionId,
        issueScope: "Download All",
        discrepancyType: "PACKAGE_SECTION_MISSING",
        expectedValue: "Section should exist in package manifest",
        actualValue: "Section missing from package manifest",
      }),
    );
  }

  for (const sectionId of orphanPackageSections) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        sectionId,
        issueScope: "Download All",
        discrepancyType: "PACKAGE_SECTION_ORPHAN",
        expectedValue: "No section expected for this sectionId",
        actualValue: "Unexpected section found in package manifest",
      }),
    );
  }

  for (const section of actualPackageManifest.sections) {
    const expectedSectionManifest = expectedSectionManifests.get(section.sectionId);
    if (!expectedSectionManifest) {
      continue;
    }

    if (section.hash !== expectedSectionManifest.hash) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId: section.sectionId,
          issueScope: "Download All",
          discrepancyType: "PACKAGE_SECTION_HASH_MISMATCH",
          expectedValue: expectedSectionManifest.hash,
          actualValue: section.hash,
        }),
      );
    }
  }

  const expectedPackageFileIds = new Set(
    Array.from(expectedSectionManifests.values()).flatMap((manifest) =>
      manifest.attachments.map((attachment) => toAttachmentId(attachment)),
    ),
  );
  const actualPackageFileIds = new Set<string>();

  for (const section of actualPackageManifest.sections) {
    let sectionManifest = actualSectionManifestById.get(section.sectionId);
    if (!sectionManifest) {
      const sectionManifestResult = await getManifestObject<AttachmentArchiveSectionManifest>({
        storage,
        key: section.manifestKey,
        preferredBucketName: packageManifestResult.bucketName,
      });
      if (sectionManifestResult && isSectionManifest(sectionManifestResult.manifest)) {
        sectionManifest = sectionManifestResult.manifest;
      }
    }

    if (!sectionManifest) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId: section.sectionId,
          issueScope: "Download All",
          discrepancyType: "PACKAGE_SECTION_MANIFEST_INVALID",
          expectedValue: section.manifestKey,
          actualValue: "Section manifest referenced by package manifest was missing or invalid",
        }),
      );
      continue;
    }

    for (const attachment of sectionManifest.attachments) {
      actualPackageFileIds.add(toAttachmentId(attachment));
    }
  }

  const missingPackageFiles = Array.from(expectedPackageFileIds).filter(
    (identifier) => !actualPackageFileIds.has(identifier),
  );
  if (missingPackageFiles.length > 0) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        issueScope: "Download All",
        discrepancyType: "PACKAGE_FILE_MISSING",
        expectedValue: stringifySampledValue(missingPackageFiles),
        actualValue: "Files were missing from package-level manifest composition",
      }),
    );
  }

  const extraPackageFiles = Array.from(actualPackageFileIds).filter(
    (identifier) => !expectedPackageFileIds.has(identifier),
  );
  if (extraPackageFiles.length > 0) {
    discrepancies.push(
      buildDiscrepancy({
        packageContext,
        issueScope: "Download All",
        discrepancyType: "PACKAGE_FILE_EXTRA",
        expectedValue: "No extra files in package-level manifest composition",
        actualValue: stringifySampledValue(extraPackageFiles),
      }),
    );
  }

  for (const sectionId of expectedSectionIds) {
    const actualSet = actualSectionFileSets.get(sectionId);
    if (!actualSet) {
      continue;
    }

    const expectedSet = new Set(
      (expectedSectionManifests.get(sectionId) || { attachments: [] }).attachments.map(
        (attachment) => toAttachmentId(attachment),
      ),
    );
    const overlap = Array.from(actualSet).filter((identifier) => expectedSet.has(identifier));
    if (overlap.length === 0) {
      discrepancies.push(
        buildDiscrepancy({
          packageContext,
          sectionId,
          issueScope: "Section",
          discrepancyType: "SECTION_EXPECTED_FILE_ISOLATION_EMPTY",
          expectedValue: "At least one expected file should be present in section manifest",
          actualValue: "Section manifest did not contain any expected files for this section",
        }),
      );
    }
  }

  return {
    discrepancies,
    sectionsScanned: expectedSectionIds.size,
  };
}

async function writeStringObject({
  bucket,
  key,
  body,
  contentType,
}: {
  bucket: string;
  key: string;
  body: string;
  contentType: string;
}) {
  await archiveBucketClient.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

function buildFailureThrowPayload({
  message,
  summaryKey,
  runId,
  stage,
  reportBucketName,
}: {
  message: string;
  summaryKey: string;
  runId: string;
  stage: string;
  reportBucketName: string;
}) {
  return JSON.stringify({
    message,
    summaryKey,
    runId,
    stage,
    reportBucketName,
  });
}

export const handler = async (): Promise<AttachmentArchiveIntegrityRunResult> => {
  const storage = getStorageConfig();
  const runTimestamp = new Date().toISOString();
  const runId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const runReportPrefix = buildReportPrefix({
    reportPrefix: storage.reportPrefix,
    runTimestamp,
    runId,
    stage: storage.stage,
  });
  const discrepancyJsonKey = `${runReportPrefix}/discrepancies.json`;
  const summaryKey = `${runReportPrefix}/summary.json`;
  const runState = {
    packagesScanned: 0,
    sectionsScanned: 0,
    discrepancies: [] as AttachmentArchiveIntegrityDiscrepancy[],
  };

  try {
    const packageIds = await listAllAttachmentArchivePackageIds();
    runState.packagesScanned = packageIds.length;

    for (const packageId of packageIds) {
      const packageContext = await buildPackageEvaluationContext(packageId);
      const packageResult = await evaluatePackageDiscrepancies({
        storage,
        packageContext,
      });
      runState.sectionsScanned += packageResult.sectionsScanned;
      runState.discrepancies.push(...packageResult.discrepancies);
    }

    const csvResult = buildCsvAttachment(runState.discrepancies);
    const discrepancyCsvKey = `${runReportPrefix}/${csvResult.filename}`;
    const discrepancyTypeCounts = buildDiscrepancyTypeCounts(runState.discrepancies);
    const topDiscrepancyTypes = buildTopDiscrepancyTypes(discrepancyTypeCounts);
    const summary: AttachmentArchiveIntegrityRunSummary = {
      runId,
      stage: storage.stage,
      runTimestamp,
      status: "SUCCESS",
      packagesScanned: runState.packagesScanned,
      sectionsScanned: runState.sectionsScanned,
      discrepancyCount: runState.discrepancies.length,
      discrepancyTypeCounts,
      topDiscrepancyTypes,
      reportBucketName: storage.writeBucketName,
      reportPrefix: runReportPrefix,
      discrepancyJsonKey,
      discrepancyCsvKey,
      discrepancyCsvFilename: csvResult.filename,
      discrepancyCsvTruncated: csvResult.truncated,
      discrepancyCsvRowsIncluded: csvResult.rowCountIncluded,
      discrepancyCsvRowsTotal: csvResult.rowCountTotal,
      notificationStatus: runState.discrepancies.length > 0 ? "PENDING" : "SKIPPED",
    };

    await putJsonObject({
      client: archiveBucketClient,
      bucket: storage.writeBucketName,
      key: discrepancyJsonKey,
      body: runState.discrepancies,
    });
    await writeStringObject({
      bucket: storage.writeBucketName,
      key: discrepancyCsvKey,
      body: csvResult.csv,
      contentType: "text/csv",
    });
    await putJsonObject({
      client: archiveBucketClient,
      bucket: storage.writeBucketName,
      key: summaryKey,
      body: summary,
    });

    return {
      runId,
      stage: summary.stage,
      runTimestamp: summary.runTimestamp,
      reportBucketName: summary.reportBucketName,
      summaryKey,
      discrepancyCsvKey,
      discrepancyCsvFilename: summary.discrepancyCsvFilename,
      discrepancyCsvTruncated: summary.discrepancyCsvTruncated,
      discrepancyCsvRowsIncluded: summary.discrepancyCsvRowsIncluded,
      discrepancyCsvRowsTotal: summary.discrepancyCsvRowsTotal,
      discrepancyCount: summary.discrepancyCount,
      discrepancyTypeCounts: summary.discrepancyTypeCounts,
      packagesScanned: summary.packagesScanned,
      sectionsScanned: summary.sectionsScanned,
    };
  } catch (error) {
    const errorMessage = toErrorMessage(error);
    const csvResult = buildCsvAttachment(runState.discrepancies);
    const discrepancyCsvKey = `${runReportPrefix}/${csvResult.filename}`;
    const discrepancyTypeCounts = buildDiscrepancyTypeCounts(runState.discrepancies);
    const failureSummary: AttachmentArchiveIntegrityRunSummary = {
      runId,
      stage: storage.stage,
      runTimestamp,
      status: "FAILED",
      packagesScanned: runState.packagesScanned,
      sectionsScanned: runState.sectionsScanned,
      discrepancyCount: runState.discrepancies.length,
      discrepancyTypeCounts,
      topDiscrepancyTypes: buildTopDiscrepancyTypes(discrepancyTypeCounts),
      reportBucketName: storage.writeBucketName,
      reportPrefix: runReportPrefix,
      discrepancyJsonKey,
      discrepancyCsvKey,
      discrepancyCsvFilename: csvResult.filename,
      discrepancyCsvTruncated: csvResult.truncated,
      discrepancyCsvRowsIncluded: csvResult.rowCountIncluded,
      discrepancyCsvRowsTotal: csvResult.rowCountTotal,
      notificationStatus: "PENDING",
      errorMessage,
    };

    await putJsonObject({
      client: archiveBucketClient,
      bucket: storage.writeBucketName,
      key: discrepancyJsonKey,
      body: runState.discrepancies,
    });
    await writeStringObject({
      bucket: storage.writeBucketName,
      key: discrepancyCsvKey,
      body: csvResult.csv,
      contentType: "text/csv",
    });
    await putJsonObject({
      client: archiveBucketClient,
      bucket: storage.writeBucketName,
      key: summaryKey,
      body: failureSummary,
    });

    throw new Error(
      buildFailureThrowPayload({
        message: errorMessage,
        summaryKey,
        runId,
        stage: storage.stage,
        reportBucketName: storage.writeBucketName,
      }),
    );
  }
};
