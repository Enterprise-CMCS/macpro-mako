import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  ObjectIdentifier,
  S3Client,
} from "@aws-sdk/client-s3";

type BucketPrefixTarget = {
  Bucket: string;
  Prefix: string;
};

const s3 = new S3Client({});
const DELETE_BATCH_SIZE = 1000;

function normalizePrefix(prefix?: string): string | undefined {
  if (!prefix) {
    return undefined;
  }

  const trimmed = prefix.replace(/^\/+|\/+$/g, "");
  return trimmed.length > 0 ? `${trimmed}/` : undefined;
}

async function deleteCurrentObjects({ bucket, prefix }: { bucket: string; prefix?: string }) {
  let continuationToken: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        Prefix: prefix,
      }),
    );

    const objects: ObjectIdentifier[] = (response.Contents || []).flatMap((object) =>
      object.Key ? [{ Key: object.Key }] : [],
    );

    for (let index = 0; index < objects.length; index += DELETE_BATCH_SIZE) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objects.slice(index, index + DELETE_BATCH_SIZE),
            Quiet: true,
          },
        }),
      );
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);
}

async function deleteVersionedObjects({ bucket, prefix }: { bucket: string; prefix?: string }) {
  let keyMarker: string | undefined;
  let versionIdMarker: string | undefined;

  do {
    const response = await s3.send(
      new ListObjectVersionsCommand({
        Bucket: bucket,
        KeyMarker: keyMarker,
        Prefix: prefix,
        VersionIdMarker: versionIdMarker,
      }),
    );

    const objects: ObjectIdentifier[] = [
      ...(response.Versions || []),
      ...(response.DeleteMarkers || []),
    ].flatMap((object) =>
      object.Key && object.VersionId
        ? [
            {
              Key: object.Key,
              VersionId: object.VersionId,
            },
          ]
        : [],
    );

    for (let index = 0; index < objects.length; index += DELETE_BATCH_SIZE) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objects.slice(index, index + DELETE_BATCH_SIZE),
            Quiet: true,
          },
        }),
      );
    }

    keyMarker = response.IsTruncated ? response.NextKeyMarker : undefined;
    versionIdMarker = response.IsTruncated ? response.NextVersionIdMarker : undefined;
  } while (keyMarker || versionIdMarker);
}

async function emptyBucket({ bucket, prefix }: { bucket: string; prefix?: string }) {
  const normalizedPrefix = normalizePrefix(prefix);
  await deleteVersionedObjects({ bucket, prefix: normalizedPrefix });
  await deleteCurrentObjects({ bucket, prefix: normalizedPrefix });
}

export const handler = async function (event: {
  RequestType?: string;
  ResourceProperties?: {
    Buckets?: string[];
    BucketPrefixes?: BucketPrefixTarget[];
  };
}) {
  console.log("Request received:\n", JSON.stringify(event, null, 2));

  if (event.RequestType !== "Delete") {
    return { skipped: true };
  }

  const buckets = event.ResourceProperties?.Buckets || [];
  const bucketPrefixes = event.ResourceProperties?.BucketPrefixes || [];

  for (const bucket of buckets) {
    await emptyBucket({ bucket });
  }

  for (const target of bucketPrefixes) {
    await emptyBucket({
      bucket: target.Bucket,
      prefix: target.Prefix,
    });
  }

  return {
    cleanedBucketCount: buckets.length,
    cleanedPrefixCount: bucketPrefixes.length,
  };
};
