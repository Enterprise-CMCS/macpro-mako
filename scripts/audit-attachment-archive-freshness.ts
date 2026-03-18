import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";

import { parseAttachmentArchiveCurrent } from "../lib/attachment-archive/archive-manifest";
import {
  ATTACHMENT_ARCHIVE_BUILD_VERSION,
  AttachmentArchiveCurrent,
} from "../lib/attachment-archive/types";

type ScriptOptions = {
  project: string;
  stage: string;
  sampleLimit: number;
  scope: "all" | "package" | "section";
  checkArtifacts: boolean;
};

type CurrentEntry = {
  key: string;
  current: AttachmentArchiveCurrent;
};

type ManifestInspection = {
  currentKey: string;
  currentStatus: string;
  hash: string;
  manifestKey: string;
  artifactKey: string;
  artifactSize?: number;
  artifactExists: boolean;
  isPackage: boolean;
  packageId: string;
  sectionId?: string;
  buildVersion?: number;
  staleReason?:
    | "missing_manifest"
    | "missing_build_version"
    | "build_version_mismatch"
    | "missing_artifact";
};

const DEFAULT_PROJECT = "mako";
const DEFAULT_STAGE = "migrate";
const DEFAULT_SAMPLE_LIMIT = 25;
const LIST_BATCH_SIZE = 1000;
const READ_BATCH_SIZE = 100;

const s3Client = new S3Client({});
const stsClient = new STSClient({});

function parseArgs(argv: string[]): ScriptOptions {
  let project = DEFAULT_PROJECT;
  let stage = DEFAULT_STAGE;
  let sampleLimit = DEFAULT_SAMPLE_LIMIT;
  let scope: ScriptOptions["scope"] = "all";
  let checkArtifacts = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--project":
        project = argv[index + 1] || project;
        index += 1;
        break;
      case "--stage":
        stage = argv[index + 1] || stage;
        index += 1;
        break;
      case "--sample-limit": {
        const parsed = Number.parseInt(argv[index + 1] || "", 10);
        if (Number.isFinite(parsed) && parsed > 0) {
          sampleLimit = parsed;
        }
        index += 1;
        break;
      }
      case "--scope": {
        const value = argv[index + 1];
        if (value === "all" || value === "package" || value === "section") {
          scope = value;
        }
        index += 1;
        break;
      }
      case "--check-artifacts":
        checkArtifacts = true;
        break;
      default:
        break;
    }
  }

  return {
    project,
    stage,
    sampleLimit,
    scope,
    checkArtifacts,
  };
}

async function getAccountId() {
  const response = await stsClient.send(new GetCallerIdentityCommand({}));
  if (!response.Account) {
    throw new Error("Unable to determine AWS account id");
  }

  return response.Account;
}

function getArchiveBucketName({
  accountId,
  project,
  stage,
}: {
  accountId: string;
  project: string;
  stage: string;
}) {
  return `${project}-${stage}-attachment-archives-${accountId}`;
}

async function listArchiveCurrentKeys(bucket: string) {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        MaxKeys: LIST_BATCH_SIZE,
        Prefix: "package/",
      }),
    );

    for (const object of response.Contents || []) {
      if (object.Key?.endsWith("/current.json")) {
        keys.push(object.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys.sort();
}

function filterCurrentKeys(keys: string[], scope: ScriptOptions["scope"]) {
  if (scope === "package") {
    return keys.filter((key) => key.includes("/all/current.json"));
  }

  if (scope === "section") {
    return keys.filter((key) => key.includes("/section/"));
  }

  return keys;
}

async function getObjectText(bucket: string, key: string) {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    return await response.Body?.transformToString();
  } catch (error) {
    const statusCode = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
      ?.httpStatusCode;
    const name = (error as { name?: string })?.name;

    if (statusCode === 404 || name === "NoSuchKey" || name === "NotFound") {
      return undefined;
    }

    throw error;
  }
}

async function headObject(bucket: string, key: string) {
  try {
    return await s3Client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch (error) {
    const statusCode = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
      ?.httpStatusCode;
    const name = (error as { name?: string })?.name;

    if (statusCode === 404 || name === "NoSuchKey" || name === "NotFound") {
      return undefined;
    }

    throw error;
  }
}

async function readCurrentEntries(bucket: string, keys: string[]) {
  const entries: CurrentEntry[] = [];

  for (let index = 0; index < keys.length; index += READ_BATCH_SIZE) {
    const batch = keys.slice(index, index + READ_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (key) => {
        const text = await getObjectText(bucket, key);
        if (!text) {
          return undefined;
        }

        const current = parseAttachmentArchiveCurrent(text);
        if (!current) {
          return undefined;
        }

        return {
          key,
          current,
        } satisfies CurrentEntry;
      }),
    );

    for (const result of results) {
      if (result) {
        entries.push(result);
      }
    }
  }

  return entries;
}

function getPackageIdFromCurrentKey(key: string) {
  const match = key.match(/^package\/([^/]+)\//);
  return match?.[1] ? decodeURIComponent(match[1]) : "unknown";
}

function getSectionIdFromCurrentKey(key: string) {
  const match = key.match(/^package\/[^/]+\/section\/([^/]+)\//);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

async function inspectCurrentEntries(
  bucket: string,
  entries: CurrentEntry[],
  checkArtifacts: boolean,
) {
  const inspections: ManifestInspection[] = [];

  for (let index = 0; index < entries.length; index += READ_BATCH_SIZE) {
    const batch = entries.slice(index, index + READ_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async ({ key, current }) => {
        const manifestText = await getObjectText(bucket, current.manifestKey);
        const artifactHead = checkArtifacts
          ? await headObject(bucket, current.artifactKey)
          : undefined;
        const artifactExists = checkArtifacts ? Boolean(artifactHead) : true;
        const artifactSize =
          checkArtifacts && typeof artifactHead?.ContentLength === "number"
            ? artifactHead.ContentLength
            : undefined;

        const inspection: ManifestInspection = {
          currentKey: key,
          currentStatus: current.status,
          hash: current.hash,
          manifestKey: current.manifestKey,
          artifactKey: current.artifactKey,
          artifactSize,
          artifactExists,
          isPackage: key.includes("/all/current.json"),
          packageId: getPackageIdFromCurrentKey(key),
          sectionId: getSectionIdFromCurrentKey(key),
        };

        if (!manifestText) {
          inspection.staleReason = "missing_manifest";
          return inspection;
        }

        const manifest = JSON.parse(manifestText) as { buildVersion?: number };
        inspection.buildVersion = manifest.buildVersion;

        if (checkArtifacts && !artifactExists) {
          inspection.staleReason = "missing_artifact";
          return inspection;
        }

        if (manifest.buildVersion === undefined) {
          inspection.staleReason = "missing_build_version";
          return inspection;
        }

        if (manifest.buildVersion !== ATTACHMENT_ARCHIVE_BUILD_VERSION) {
          inspection.staleReason = "build_version_mismatch";
          return inspection;
        }

        return inspection;
      }),
    );

    inspections.push(...results);
  }

  return inspections;
}

function takeSample<T>(items: T[], sampleLimit: number) {
  return items.slice(0, sampleLimit);
}

function countBy<T extends string | number>(values: T[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[String(value)] = (acc[String(value)] || 0) + 1;
    return acc;
  }, {});
}

function summarizeInspections(inspections: ManifestInspection[], sampleLimit: number) {
  const packageEntries = inspections.filter((entry) => entry.isPackage);
  const sectionEntries = inspections.filter((entry) => !entry.isPackage);
  const staleEntries = inspections.filter((entry) => entry.staleReason);
  const stalePackageEntries = staleEntries.filter((entry) => entry.isPackage);
  const staleSectionEntries = staleEntries.filter((entry) => !entry.isPackage);
  const stalePackageIds = Array.from(new Set(staleEntries.map((entry) => entry.packageId))).sort();

  return {
    totals: {
      allCurrentPointers: inspections.length,
      packageCurrentPointers: packageEntries.length,
      sectionCurrentPointers: sectionEntries.length,
      staleCurrentPointers: staleEntries.length,
      stalePackagePointers: stalePackageEntries.length,
      staleSectionPointers: staleSectionEntries.length,
      stalePackageCount: stalePackageIds.length,
    },
    staleReasons: countBy(staleEntries.map((entry) => entry.staleReason || "unknown")),
    stalePackageIdSamples: takeSample(stalePackageIds, sampleLimit),
    stalePointerSamples: takeSample(
      staleEntries.map((entry) => ({
        packageId: entry.packageId,
        sectionId: entry.sectionId,
        currentKey: entry.currentKey,
        artifactKey: entry.artifactKey,
        artifactSize: entry.artifactSize,
        buildVersion: entry.buildVersion,
        staleReason: entry.staleReason,
      })),
      sampleLimit,
    ),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const accountId = await getAccountId();
  const archiveBucketName = getArchiveBucketName({
    accountId,
    project: options.project,
    stage: options.stage,
  });

  console.error(`Auditing archive freshness for s3://${archiveBucketName}`);

  const currentKeys = filterCurrentKeys(
    await listArchiveCurrentKeys(archiveBucketName),
    options.scope,
  );
  const currentEntries = await readCurrentEntries(archiveBucketName, currentKeys);
  const inspections = await inspectCurrentEntries(
    archiveBucketName,
    currentEntries,
    options.checkArtifacts,
  );
  const summary = summarizeInspections(inspections, options.sampleLimit);

  console.log(
    JSON.stringify(
      {
        archiveBucketName,
        expectedBuildVersion: ATTACHMENT_ARCHIVE_BUILD_VERSION,
        scope: options.scope,
        checkArtifacts: options.checkArtifacts,
        ...summary,
      },
      null,
      2,
    ),
  );
}

await main();
