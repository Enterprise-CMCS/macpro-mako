import {
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  getArchiveCurrentKey,
  parseAttachmentArchiveCurrent,
} from "../attachment-archive/archive-manifest";
import {
  listAllAttachmentArchivePackageIds,
  listAllAttachmentArchiveSections,
} from "../attachment-archive/backfill";

const MAX_SAMPLE_ITEMS = 25;
const STATUS_BATCH_SIZE = 25;
const archiveBucketClient = new S3Client({ region: process.env.region || process.env.AWS_REGION });

function getArchiveBucketName() {
  const bucketName = process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("ATTACHMENT_ARCHIVE_BUCKET_NAME must be defined");
  }

  return bucketName;
}

async function listArchiveCurrentKeys(bucket: string) {
  const keys = new Set<string>();
  let continuationToken: string | undefined;

  do {
    const response = (await archiveBucketClient.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        Prefix: "package/",
      }),
    )) as ListObjectsV2CommandOutput;

    for (const object of response.Contents || []) {
      if (object.Key?.endsWith("/current.json")) {
        keys.add(object.Key);
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return Array.from(keys).sort();
}

async function getCurrentStatus({ bucket, key }: { bucket: string; key: string }) {
  const response = await archiveBucketClient.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  const body = await response.Body?.transformToString();
  return parseAttachmentArchiveCurrent(body);
}

async function listNonReadyCurrentKeys({
  bucket,
  currentKeys,
}: {
  bucket: string;
  currentKeys: string[];
}) {
  const notReadyKeys: string[] = [];

  for (let index = 0; index < currentKeys.length; index += STATUS_BATCH_SIZE) {
    const batch = currentKeys.slice(index, index + STATUS_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (key) => {
        const current = await getCurrentStatus({ bucket, key });
        return current?.status === "READY" ? undefined : key;
      }),
    );

    for (const key of results) {
      if (key) {
        notReadyKeys.push(key);
      }
    }
  }

  return notReadyKeys.sort();
}

function sampleItems<T>(items: T[]) {
  return items.slice(0, MAX_SAMPLE_ITEMS);
}

export const handler = async () => {
  const archiveBucketName = getArchiveBucketName();
  const [expectedPackageIds, expectedSections, currentKeys] = await Promise.all([
    listAllAttachmentArchivePackageIds(),
    listAllAttachmentArchiveSections(),
    listArchiveCurrentKeys(archiveBucketName),
  ]);
  const currentKeySet = new Set(currentKeys);

  const expectedPackageKeys = new Set(
    expectedPackageIds.map((packageId) => getArchiveCurrentKey({ packageId, scope: "all" })),
  );
  const expectedSectionKeys = new Set(
    expectedSections.map((item) => {
      const [packageId, sectionId] = item.split("::");
      return getArchiveCurrentKey({
        packageId,
        scope: "section",
        sectionId,
      });
    }),
  );

  const existingPackageKeys = currentKeys.filter((key) => key.includes("/all/current.json"));
  const existingSectionKeys = currentKeys.filter((key) => key.includes("/section/"));

  const missingPackageKeys = Array.from(expectedPackageKeys).filter(
    (key) => !currentKeySet.has(key),
  );
  const missingSectionKeys = Array.from(expectedSectionKeys).filter(
    (key) => !currentKeySet.has(key),
  );
  const extraPackageKeys = existingPackageKeys.filter((key) => !expectedPackageKeys.has(key));
  const extraSectionKeys = existingSectionKeys.filter((key) => !expectedSectionKeys.has(key));
  const notReadyKeys = await listNonReadyCurrentKeys({
    bucket: archiveBucketName,
    currentKeys,
  });
  const notReadyPackageKeys = notReadyKeys.filter((key) => key.includes("/all/current.json"));
  const notReadySectionKeys = notReadyKeys.filter((key) => key.includes("/section/"));

  return {
    archiveBucketName,
    exactCoverageMatches:
      missingPackageKeys.length === 0 &&
      missingSectionKeys.length === 0 &&
      extraPackageKeys.length === 0 &&
      extraSectionKeys.length === 0 &&
      notReadyKeys.length === 0,
    packageCoverage: {
      expected: expectedPackageKeys.size,
      existing: existingPackageKeys.length,
      extra: extraPackageKeys.length,
      missing: missingPackageKeys.length,
      notReady: notReadyPackageKeys.length,
      extraSamples: sampleItems(extraPackageKeys),
      missingSamples: sampleItems(missingPackageKeys),
      notReadySamples: sampleItems(notReadyPackageKeys),
    },
    sectionCoverage: {
      expected: expectedSectionKeys.size,
      existing: existingSectionKeys.length,
      extra: extraSectionKeys.length,
      missing: missingSectionKeys.length,
      notReady: notReadySectionKeys.length,
      extraSamples: sampleItems(extraSectionKeys),
      missingSamples: sampleItems(missingSectionKeys),
      notReadySamples: sampleItems(notReadySectionKeys),
    },
  };
};
