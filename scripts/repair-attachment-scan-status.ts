import {
  CloudFormationClient,
  ListStackResourcesCommand,
  StackResourceSummary,
} from "@aws-sdk/client-cloudformation";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import {
  GetObjectCommand,
  GetObjectTaggingCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectTaggingCommand,
  S3Client,
  Tag,
} from "@aws-sdk/client-s3";
import { GetQueueUrlCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import fs from "fs/promises";
import path from "path";

import { parseAttachmentArchiveCurrent } from "../lib/attachment-archive/archive-manifest";
import {
  AttachmentArchiveRepairClassification,
  classifyPackageRepairCandidate,
  getIntegrityReportPackageIds,
  parseIntegrityReportCsv,
  resolveQueuedPackageIds,
} from "../lib/attachment-archive/repair-audit";
import { buildAttachmentArchiveMessageGroupId } from "../lib/attachment-archive/rebuild-queue";
import {
  buildSyntheticScannerInvokePayload,
  isManualCleanRetagEligible,
  upsertScanTags,
} from "../lib/attachment-archive/source-repair";
import {
  AttachmentArchiveCurrent,
  AttachmentArchivePackageManifest,
  AttachmentArchiveSectionManifest,
} from "../lib/attachment-archive/types";
import {
  getArchiveBaseReadBucket,
  getArchiveOverlayPrefix,
  getEphemeralArchiveOverlayBucket,
  isSharedArchiveStage,
} from "../lib/stacks/archive-bucket-routing";
import { resolveAttachmentReadStage } from "../lib/stacks/legacy-attachment-bucket-map";

type ScriptOptions = {
  allFailed: boolean;
  applyRetag: boolean;
  dryRun: boolean;
  inputCsvPath?: string;
  packageId?: string;
  project: string;
  rebuildInputPackages: boolean;
  stage: string;
  waitForRebuild: boolean;
  writeAuditPath?: string;
};

type ArchiveStorageConfig = {
  baseReadBucketName: string;
  keyPrefix: string;
  usesOverlay: boolean;
  writeBucketName: string;
};

type CurrentEntry = {
  current: AttachmentArchiveCurrent;
  currentKey: string;
  manifest?: AttachmentArchivePackageManifest | AttachmentArchiveSectionManifest;
};

type SourceObjectInspection = {
  bucket: string;
  exists: boolean;
  filename: string;
  key: string;
  packageId: string;
  sectionId?: string;
  versionId?: string;
  virusScanStatus?: string;
  tagSet: Tag[];
};

type RepairAuditEntry = {
  action:
    | "classified"
    | "inspected"
    | "redrive"
    | "retagged"
    | "rebuild_queued"
    | "rebuild_ready"
    | "rebuild_failed";
  bucket?: string;
  currentKey?: string;
  filename?: string;
  key?: string;
  packageId?: string;
  reason?: string;
  result?: string;
  sectionId?: string;
  versionId?: string;
  virusScanStatus?: string;
};

type PackageRepairAudit = {
  packageId: string;
  classification: AttachmentArchiveRepairClassification;
  discrepancyTypes: string[];
  failedCurrentCount: number;
  sourceInspectionCount: number;
  statuses: Array<{
    currentKey: string;
    failureCode?: AttachmentArchiveCurrent["failureCode"];
    status: AttachmentArchiveCurrent["status"];
  }>;
};

const CLEAN_STATUS = "CLEAN";
const DEFAULT_PROJECT = "mako";
const POLL_INTERVAL_MS = 10_000;
const POLL_TIMEOUT_MS = 10 * 60_000;

const s3Client = new S3Client({});
const cloudFormationClient = new CloudFormationClient({});
const stsClient = new STSClient({});
const lambdaClient = new LambdaClient({});
const sqsClient = new SQSClient({});

function parseArgs(argv: string[]): ScriptOptions {
  let stage = "migrate";
  let project = DEFAULT_PROJECT;
  let packageId: string | undefined;
  let inputCsvPath: string | undefined;
  let writeAuditPath: string | undefined;
  let allFailed = false;
  let applyRetag = false;
  let dryRun = false;
  let rebuildInputPackages = false;
  let waitForRebuild = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--stage":
        stage = argv[index + 1] || stage;
        index += 1;
        break;
      case "--project":
        project = argv[index + 1] || project;
        index += 1;
        break;
      case "--package-id":
        packageId = argv[index + 1];
        index += 1;
        break;
      case "--input-csv":
        inputCsvPath = argv[index + 1];
        index += 1;
        break;
      case "--write-audit":
        writeAuditPath = argv[index + 1];
        index += 1;
        break;
      case "--all-failed":
        allFailed = true;
        break;
      case "--apply-retag":
        applyRetag = true;
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--rebuild-input-packages":
        rebuildInputPackages = true;
        break;
      case "--wait":
        waitForRebuild = true;
        break;
      default:
        break;
    }
  }

  if (!packageId && !allFailed && !inputCsvPath) {
    throw new Error("Pass --package-id <id>, --input-csv <path>, or --all-failed");
  }

  const selectionModeCount = [Boolean(packageId), allFailed, Boolean(inputCsvPath)].filter(
    Boolean,
  ).length;
  if (selectionModeCount > 1) {
    throw new Error("Use only one of --package-id, --input-csv, or --all-failed");
  }

  if (waitForRebuild && !packageId) {
    throw new Error("--wait currently requires --package-id");
  }

  return {
    allFailed,
    applyRetag,
    dryRun,
    inputCsvPath,
    packageId,
    project,
    rebuildInputPackages,
    stage,
    waitForRebuild,
    writeAuditPath,
  };
}

async function getAccountId() {
  const response = await stsClient.send(new GetCallerIdentityCommand({}));
  if (!response.Account) {
    throw new Error("Unable to determine AWS account id");
  }

  return response.Account;
}

async function listStackResources(stackName: string) {
  const response = await cloudFormationClient.send(
    new ListStackResourcesCommand({
      StackName: stackName,
    }),
  );

  return response.StackResourceSummaries || [];
}

function getNestedStackName(resources: StackResourceSummary[], logicalIdPart: string) {
  const match = resources.find(
    (resource) =>
      resource.ResourceType === "AWS::CloudFormation::Stack" &&
      resource.LogicalResourceId?.includes(logicalIdPart) &&
      resource.PhysicalResourceId,
  );

  if (!match?.PhysicalResourceId) {
    throw new Error(`Unable to find nested stack containing ${logicalIdPart}`);
  }

  return match.PhysicalResourceId.split("/")[1] || match.PhysicalResourceId;
}

async function getScannerFunctionName({
  project,
  readStage,
}: {
  project: string;
  readStage: string;
}) {
  const rootResources = await listStackResources(`${project}-${readStage}`);
  const uploadsNestedStackName = getNestedStackName(rootResources, "uploadsNestedStack");
  const nestedResources = await listStackResources(uploadsNestedStackName);
  const match = nestedResources.find(
    (resource) =>
      resource.ResourceType === "AWS::Lambda::Function" &&
      resource.LogicalResourceId?.includes("ClamScanServerlessClamscan") &&
      resource.PhysicalResourceId,
  );

  if (!match?.PhysicalResourceId) {
    throw new Error(`Unable to locate the ClamAV scanner lambda for stage ${readStage}`);
  }

  return match.PhysicalResourceId;
}

async function getRebuildQueueUrl(project: string, stage: string) {
  const response = await sqsClient.send(
    new GetQueueUrlCommand({
      QueueName: `${project}-${stage}-attachment-archive-rebuild.fifo`,
    }),
  );

  if (!response.QueueUrl) {
    throw new Error(`Unable to resolve rebuild queue for ${project}-${stage}`);
  }

  return response.QueueUrl;
}

function getArchiveStorageConfig({
  accountId,
  project,
  stage,
}: {
  accountId: string;
  project: string;
  stage: string;
}): ArchiveStorageConfig {
  const baseReadBucket = getArchiveBaseReadBucket(project, stage, accountId);

  if (isSharedArchiveStage(stage)) {
    return {
      baseReadBucketName: baseReadBucket.name,
      keyPrefix: "",
      usesOverlay: false,
      writeBucketName: baseReadBucket.name,
    };
  }

  const overlayBucket = getEphemeralArchiveOverlayBucket(project, accountId);
  return {
    baseReadBucketName: baseReadBucket.name,
    keyPrefix: getArchiveOverlayPrefix(stage),
    usesOverlay: true,
    writeBucketName: overlayBucket.name,
  };
}

function normalizeArchiveKeyPrefix(keyPrefix?: string) {
  return (keyPrefix || "").replace(/^\/+|\/+$/g, "");
}

function applyArchiveKeyPrefix(key: string, keyPrefix?: string) {
  const normalizedPrefix = normalizeArchiveKeyPrefix(keyPrefix);
  return normalizedPrefix ? `${normalizedPrefix}/${key}` : key;
}

function removeArchiveKeyPrefix(key: string, keyPrefix?: string) {
  const normalizedPrefix = normalizeArchiveKeyPrefix(keyPrefix);
  if (!normalizedPrefix) {
    return key;
  }

  const expectedPrefix = `${normalizedPrefix}/`;
  return key.startsWith(expectedPrefix) ? key.slice(expectedPrefix.length) : key;
}

async function listArchiveCurrentKeys({
  archiveBucketName,
  keyPrefix,
  packageId,
}: {
  archiveBucketName: string;
  keyPrefix?: string;
  packageId?: string;
}) {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  const prefix = applyArchiveKeyPrefix(
    packageId ? `package/${encodeURIComponent(packageId)}/` : "package/",
    keyPrefix,
  );

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: archiveBucketName,
        ContinuationToken: continuationToken,
        Prefix: prefix,
      }),
    );

    for (const object of response.Contents || []) {
      if (object.Key?.endsWith("/current.json")) {
        keys.push(removeArchiveKeyPrefix(object.Key, keyPrefix));
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys.sort();
}

async function getJsonObject<T>({ bucket, key }: { bucket: string; key: string }) {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
  const body = await response.Body?.transformToString();
  if (!body) {
    throw new Error(`Missing body for s3://${bucket}/${key}`);
  }

  return JSON.parse(body) as T;
}

async function loadCurrentEntries({
  archiveBucketName,
  keyPrefix,
  packageIds,
}: {
  archiveBucketName: string;
  keyPrefix?: string;
  packageIds?: string[];
}) {
  const currentKeys = packageIds
    ? Array.from(
        new Set(
          (
            await Promise.all(
              packageIds.map((packageId) =>
                listArchiveCurrentKeys({ archiveBucketName, keyPrefix, packageId }),
              ),
            )
          ).flat(),
        ),
      ).sort()
    : await listArchiveCurrentKeys({ archiveBucketName, keyPrefix });
  const entries: CurrentEntry[] = [];

  for (const currentKey of currentKeys) {
    const body = await s3Client.send(
      new GetObjectCommand({
        Bucket: archiveBucketName,
        Key: applyArchiveKeyPrefix(currentKey, keyPrefix),
      }),
    );
    const text = await body.Body?.transformToString();
    const current = parseAttachmentArchiveCurrent(text);
    if (!current) {
      continue;
    }

    const manifest = await getJsonObject<AttachmentArchivePackageManifest | AttachmentArchiveSectionManifest>(
      {
        bucket: archiveBucketName,
        key: current.manifestKey,
      },
    ).catch(() => undefined);

    entries.push({ current, currentKey, manifest });
  }

  return entries;
}

async function loadInputCsvPackageSelection(inputCsvPath: string) {
  const csv = await fs.readFile(inputCsvPath, "utf8");
  const reportRows = parseIntegrityReportCsv(csv);
  return {
    reportRows,
    packageIds: getIntegrityReportPackageIds(reportRows),
  };
}

async function inspectSourceObject({
  attachment,
  packageId,
  sectionId,
}: {
  attachment: { bucket: string; filename: string; key: string };
  packageId: string;
  sectionId?: string;
}): Promise<SourceObjectInspection> {
  try {
    const response = await s3Client.send(
      new GetObjectTaggingCommand({
        Bucket: attachment.bucket,
        Key: attachment.key,
      }),
    );
    const virusScanStatus = response.TagSet?.find((tag) => tag.Key === "virusScanStatus")?.Value;

    return {
      bucket: attachment.bucket,
      exists: true,
      filename: attachment.filename,
      key: attachment.key,
      packageId,
      sectionId,
      tagSet: response.TagSet || [],
      versionId: response.VersionId,
      virusScanStatus,
    };
  } catch (error) {
    const message = `${error}`;
    if (message.includes("NoSuchKey") || message.includes("NotFound")) {
      return {
        bucket: attachment.bucket,
        exists: false,
        filename: attachment.filename,
        key: attachment.key,
        packageId,
        sectionId,
        tagSet: [],
      };
    }
    throw error;
  }
}

function getSectionInspections(entries: CurrentEntry[]) {
  const inspections = new Map<string, SourceObjectInspection>();

  for (const entry of entries) {
    if (entry.manifest?.type !== "section") {
      continue;
    }

    for (const attachment of entry.manifest.attachments) {
      const id = `${entry.manifest.packageId}::${entry.manifest.sectionId}::${attachment.bucket}::${attachment.key}`;
      inspections.set(id, {
        bucket: attachment.bucket,
        exists: true,
        filename: attachment.filename,
        key: attachment.key,
        packageId: entry.manifest.packageId,
        sectionId: entry.manifest.sectionId,
        tagSet: [],
      });
    }
  }

  return Array.from(inspections.values());
}

async function redriveScanner({
  bucket,
  key,
  scannerFunctionName,
}: {
  bucket: string;
  key: string;
  scannerFunctionName: string;
}) {
  const response = await lambdaClient.send(
    new InvokeCommand({
      FunctionName: scannerFunctionName,
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify(buildSyntheticScannerInvokePayload({ bucket, key }))),
    }),
  );
  const payload = response.Payload ? Buffer.from(response.Payload).toString() : undefined;
  return payload ? JSON.parse(payload) : undefined;
}

async function tryHeadObject(bucket: string, key: string) {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return true;
  } catch {
    return false;
  }
}

async function retagObjectClean(inspection: SourceObjectInspection) {
  const timestamp = Date.now().toString();
  await s3Client.send(
    new PutObjectTaggingCommand({
      Bucket: inspection.bucket,
      Key: inspection.key,
      ...(inspection.versionId ? { VersionId: inspection.versionId } : {}),
      Tagging: {
        TagSet: upsertScanTags({
          existingTags: inspection.tagSet,
          status: CLEAN_STATUS,
          timestamp,
        }),
      },
    }),
  );
}

async function queuePackageRebuild({
  latestTimestamp,
  packageId,
  queueUrl,
}: {
  latestTimestamp: number;
  packageId: string;
  queueUrl: string;
}) {
  await sqsClient.send(
    new SendMessageCommand({
      MessageBody: JSON.stringify({
        latestTimestamp,
        packageId,
        source: "backfill",
      }),
      MessageGroupId: buildAttachmentArchiveMessageGroupId(packageId),
      QueueUrl: queueUrl,
    }),
  );
}

async function readCurrentStatusesForPackage({
  archiveBucketName,
  keyPrefix,
  packageId,
}: {
  archiveBucketName: string;
  keyPrefix?: string;
  packageId: string;
}) {
  const keys = await listArchiveCurrentKeys({ archiveBucketName, keyPrefix, packageId });
  const statuses: Record<string, AttachmentArchiveCurrent["status"]> = {};

  for (const key of keys) {
    const current = parseAttachmentArchiveCurrent(
      await (
        await s3Client.send(
          new GetObjectCommand({
            Bucket: archiveBucketName,
            Key: applyArchiveKeyPrefix(key, keyPrefix),
          }),
        )
      ).Body?.transformToString(),
    );
    if (current) {
      statuses[key] = current.status;
    }
  }

  return statuses;
}

async function waitForPackageReady({
  archiveBucketName,
  keyPrefix,
  packageId,
}: {
  archiveBucketName: string;
  keyPrefix?: string;
  packageId: string;
}) {
  const start = Date.now();
  let sawActiveRebuild = false;

  while (Date.now() - start < POLL_TIMEOUT_MS) {
    const statuses = await readCurrentStatusesForPackage({
      archiveBucketName,
      keyPrefix,
      packageId,
    });
    const values = Object.values(statuses);

    if (values.length > 0 && values.every((status) => status === "READY")) {
      return { ready: true, statuses };
    }

    if (values.some((status) => status === "PENDING" || status === "RUNNING")) {
      sawActiveRebuild = true;
    }

    if (sawActiveRebuild && values.some((status) => status === "FAILED")) {
      return { ready: false, statuses };
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  return {
    ready: false,
    statuses: await readCurrentStatusesForPackage({ archiveBucketName, keyPrefix, packageId }),
  };
}

function parsePackageIdFromCurrentKey(currentKey: string) {
  const match = currentKey.match(/^package\/([^/]+)\//);
  if (!match) {
    return undefined;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

function buildPackageRepairAudits({
  packageIds,
  currentEntries,
  reportRowsByPackageId,
  sourceInspectionsByPackageId,
}: {
  packageIds: string[];
  currentEntries: CurrentEntry[];
  reportRowsByPackageId: Map<string, Set<string>>;
  sourceInspectionsByPackageId: Map<string, SourceObjectInspection[]>;
}) {
  const currentEntriesByPackageId = currentEntries.reduce<Map<string, CurrentEntry[]>>(
    (packages, entry) => {
      const packageId = entry.manifest?.packageId || parsePackageIdFromCurrentKey(entry.currentKey);
      if (!packageId) {
        return packages;
      }

      const existing = packages.get(packageId) || [];
      existing.push(entry);
      packages.set(packageId, existing);
      return packages;
    },
    new Map(),
  );

  return packageIds.map<PackageRepairAudit>((packageId) => {
    const packageCurrentEntries = currentEntriesByPackageId.get(packageId) || [];
    const packageInspections = sourceInspectionsByPackageId.get(packageId) || [];
    return {
      packageId,
      classification: classifyPackageRepairCandidate({
        currentEntries: packageCurrentEntries.map((entry) => ({
          status: entry.current.status,
          failureCode: entry.current.failureCode,
        })),
        sourceInspections: packageInspections.map((inspection) => ({
          exists: inspection.exists,
          virusScanStatus: inspection.virusScanStatus,
        })),
      }),
      discrepancyTypes: Array.from(reportRowsByPackageId.get(packageId) || []).sort(),
      failedCurrentCount: packageCurrentEntries.filter((entry) => entry.current.status === "FAILED")
        .length,
      sourceInspectionCount: packageInspections.length,
      statuses: packageCurrentEntries
        .map((entry) => ({
          currentKey: entry.currentKey,
          failureCode: entry.current.failureCode,
          status: entry.current.status,
        }))
        .sort((left, right) => left.currentKey.localeCompare(right.currentKey)),
    };
  });
}

function buildClassificationCounts(packageAudits: PackageRepairAudit[]) {
  return packageAudits.reduce<Record<AttachmentArchiveRepairClassification, number>>(
    (counts, audit) => {
      counts[audit.classification] += 1;
      return counts;
    },
    {
      repairable_scan_failure: 0,
      terminal_exception_candidate: 0,
      rebuild_only: 0,
      residual_worker_failure: 0,
    },
  );
}

async function writeAuditLog(pathToWrite: string | undefined, body: unknown) {
  if (!pathToWrite) {
    return;
  }

  await fs.mkdir(path.dirname(pathToWrite), { recursive: true });
  await fs.writeFile(pathToWrite, JSON.stringify(body, null, 2));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const auditEntries: RepairAuditEntry[] = [];
  const inputSelection = options.inputCsvPath
    ? await loadInputCsvPackageSelection(options.inputCsvPath)
    : undefined;
  const reportRowsByPackageId = (inputSelection?.reportRows || []).reduce<Map<string, Set<string>>>(
    (packages, row) => {
      const existing = packages.get(row.packageId) || new Set<string>();
      existing.add(row.discrepancyType);
      packages.set(row.packageId, existing);
      return packages;
    },
    new Map(),
  );

  const accountId = await getAccountId();
  const readStage = resolveAttachmentReadStage(options.stage);
  const archiveStorage = getArchiveStorageConfig({
    accountId,
    project: options.project,
    stage: options.stage,
  });
  const sourceBucketName = `${options.project}-${readStage}-attachments-${accountId}`;
  const scannerFunctionName = await getScannerFunctionName({
    project: options.project,
    readStage,
  });
  console.info(
    JSON.stringify({
      event: "attachment_scan_repair_resolved_config",
      stage: options.stage,
      effectiveAttachmentReadStage: readStage,
      sourceBucketName,
      scannerFunctionName,
      archiveWriteBucketName: archiveStorage.writeBucketName,
      archiveBaseReadBucketName: archiveStorage.baseReadBucketName,
      archiveKeyPrefix: archiveStorage.keyPrefix,
      archiveUsesOverlay: archiveStorage.usesOverlay,
    }),
  );
  const rebuildQueueUrl = await getRebuildQueueUrl(options.project, options.stage);

  const requestedPackageIds = inputSelection?.packageIds || (options.packageId ? [options.packageId] : undefined);
  const currentEntries = await loadCurrentEntries({
    archiveBucketName: archiveStorage.writeBucketName,
    keyPrefix: archiveStorage.keyPrefix,
    packageIds: requestedPackageIds,
  });
  const failedEntries = currentEntries.filter((entry) => entry.current.status === "FAILED");
  const targetPackageIds =
    requestedPackageIds ||
    Array.from(
      new Set(
        failedEntries
          .map((entry) => entry.manifest?.packageId || parsePackageIdFromCurrentKey(entry.currentKey))
          .filter((packageId): packageId is string => Boolean(packageId)),
      ),
    ).sort();

  const inspections = getSectionInspections(failedEntries).filter(
    (inspection) => inspection.bucket === sourceBucketName,
  );

  const refreshedInspections: SourceObjectInspection[] = [];
  for (const inspection of inspections) {
    const refreshed = await inspectSourceObject({
      attachment: inspection,
      packageId: inspection.packageId,
      sectionId: inspection.sectionId,
    });
    refreshedInspections.push(refreshed);
    auditEntries.push({
      action: "inspected",
      bucket: refreshed.bucket,
      filename: refreshed.filename,
      key: refreshed.key,
      packageId: refreshed.packageId,
      sectionId: refreshed.sectionId,
      versionId: refreshed.versionId,
      virusScanStatus: refreshed.virusScanStatus,
    });
  }

  const blocked = refreshedInspections.filter(
    (inspection) => inspection.exists && inspection.virusScanStatus !== CLEAN_STATUS,
  );
  const finalInspections = new Map(
    refreshedInspections.map((inspection) => [
      `${inspection.packageId}::${inspection.sectionId || ""}::${inspection.bucket}::${inspection.key}`,
      inspection,
    ]),
  );

  if (!options.dryRun) {
    for (const inspection of blocked) {
      const redriveResult = await redriveScanner({
        bucket: inspection.bucket,
        key: inspection.key,
        scannerFunctionName,
      });
      auditEntries.push({
        action: "redrive",
        bucket: inspection.bucket,
        filename: inspection.filename,
        key: inspection.key,
        packageId: inspection.packageId,
        result: JSON.stringify(redriveResult),
        sectionId: inspection.sectionId,
      });

      const afterRedrive = await inspectSourceObject({
        attachment: inspection,
        packageId: inspection.packageId,
        sectionId: inspection.sectionId,
      });
      finalInspections.set(
        `${afterRedrive.packageId}::${afterRedrive.sectionId || ""}::${afterRedrive.bucket}::${afterRedrive.key}`,
        afterRedrive,
      );

      if (
        options.applyRetag &&
        isManualCleanRetagEligible({
          attemptedRedrive: true,
          bucket: afterRedrive.bucket,
          exists: afterRedrive.exists,
          filename: afterRedrive.filename,
          virusScanStatus: afterRedrive.virusScanStatus,
        })
      ) {
        await retagObjectClean(afterRedrive);
        const afterRetag = await inspectSourceObject({
          attachment: afterRedrive,
          packageId: afterRedrive.packageId,
          sectionId: afterRedrive.sectionId,
        });
        finalInspections.set(
          `${afterRetag.packageId}::${afterRetag.sectionId || ""}::${afterRetag.bucket}::${afterRetag.key}`,
          afterRetag,
        );
        const headSucceeded = await tryHeadObject(afterRetag.bucket, afterRetag.key);

        auditEntries.push({
          action: "retagged",
          bucket: afterRetag.bucket,
          filename: afterRetag.filename,
          key: afterRetag.key,
          packageId: afterRetag.packageId,
          reason: headSucceeded
            ? "tag_repaired_and_head_succeeds"
            : "tag_repaired_head_still_blocked",
          sectionId: afterRetag.sectionId,
          versionId: afterRetag.versionId,
          virusScanStatus: afterRetag.virusScanStatus,
        });
      }
    }
  }

  const sourceInspectionsByPackageId = Array.from(finalInspections.values()).reduce<
    Map<string, SourceObjectInspection[]>
  >((packages, inspection) => {
    const existing = packages.get(inspection.packageId) || [];
    existing.push(inspection);
    packages.set(inspection.packageId, existing);
    return packages;
  }, new Map());
  const packageAudits = buildPackageRepairAudits({
    packageIds: targetPackageIds,
    currentEntries,
    reportRowsByPackageId,
    sourceInspectionsByPackageId,
  });
  for (const packageAudit of packageAudits) {
    auditEntries.push({
      action: "classified",
      packageId: packageAudit.packageId,
      result: JSON.stringify(packageAudit),
    });
  }

  const packageInspectionMap = Array.from(finalInspections.values()).reduce<
    Map<string, SourceObjectInspection[]>
  >((packages, inspection) => {
    const existing = packages.get(inspection.packageId) || [];
    existing.push(inspection);
    packages.set(inspection.packageId, existing);
    return packages;
  }, new Map());

  const packageIdsToRebuild = new Set(
    Array.from(packageInspectionMap.entries())
      .filter(([, packageInspections]) =>
        packageInspections.every(
          (inspection) => !inspection.exists || inspection.virusScanStatus === CLEAN_STATUS,
        ),
      )
      .map(([packageId]) => packageId),
  );

  const queuedPackageIds = resolveQueuedPackageIds({
    inputPackageIds: targetPackageIds,
    packageIdsToRebuild: Array.from(packageIdsToRebuild),
    rebuildInputPackages: options.rebuildInputPackages,
  });

  if (!options.dryRun) {
    for (const packageId of queuedPackageIds) {
      await queuePackageRebuild({
        latestTimestamp: Date.now(),
        packageId,
        queueUrl: rebuildQueueUrl,
      });
      auditEntries.push({
        action: "rebuild_queued",
        packageId,
      });
    }
  }

  if (options.waitForRebuild && options.packageId) {
    const result = await waitForPackageReady({
      archiveBucketName: archiveStorage.writeBucketName,
      keyPrefix: archiveStorage.keyPrefix,
      packageId: options.packageId,
    });

    auditEntries.push({
      action: result.ready ? "rebuild_ready" : "rebuild_failed",
      packageId: options.packageId,
      result: JSON.stringify(result.statuses),
    });
  }

  await writeAuditLog(options.writeAuditPath, {
    actions: auditEntries,
    packageAudits,
  });

  const summary = {
    applyRetag: options.applyRetag,
    archiveBaseReadBucketName: archiveStorage.baseReadBucketName,
    archiveBucketName: archiveStorage.writeBucketName,
    archiveKeyPrefix: archiveStorage.keyPrefix,
    archiveUsesOverlay: archiveStorage.usesOverlay,
    blockedObjectCount: blocked.length,
    dryRun: options.dryRun,
    effectiveAttachmentReadStage: readStage,
    failedCurrentCount: failedEntries.length,
    inputCsvPath: options.inputCsvPath,
    inputPackageCount: inputSelection?.packageIds.length || 0,
    packageClassificationCounts: buildClassificationCounts(packageAudits),
    packageIdsQueued: options.dryRun ? [] : queuedPackageIds,
    scannerFunctionName,
    scannerStage: readStage,
    stage: options.stage,
    sourceBucketName,
    targetPackageCount: targetPackageIds.length,
    writeAuditPath: options.writeAuditPath,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
