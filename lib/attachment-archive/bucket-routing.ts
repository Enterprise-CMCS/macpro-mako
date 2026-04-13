import { S3Client } from "@aws-sdk/client-s3";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";

export type AttachmentBucketMap = Record<string, string>;

const NO_MAP_CONFIGURED = "__NO_MAP_CONFIGURED__";

let cachedAttachmentBucketMap: AttachmentBucketMap | undefined;
let cachedAttachmentBucketMapRaw = NO_MAP_CONFIGURED;

export function isLegacyUploadBucket(bucket: string): boolean {
  return bucket.startsWith("uploads");
}

export function parseAttachmentBucketMap(rawMap?: string): AttachmentBucketMap {
  if (cachedAttachmentBucketMap && cachedAttachmentBucketMapRaw === (rawMap ?? NO_MAP_CONFIGURED)) {
    return cachedAttachmentBucketMap;
  }

  cachedAttachmentBucketMapRaw = rawMap ?? NO_MAP_CONFIGURED;

  if (!rawMap) {
    cachedAttachmentBucketMap = {};
    return cachedAttachmentBucketMap;
  }

  const parsedMap: unknown = JSON.parse(rawMap);
  if (typeof parsedMap !== "object" || parsedMap === null || Array.isArray(parsedMap)) {
    throw new Error("LEGACY_ATTACHMENT_BUCKET_MAP must be a JSON object");
  }

  cachedAttachmentBucketMap = Object.entries(parsedMap).reduce<AttachmentBucketMap>(
    (acc, [sourceBucket, destinationBucket]) => {
      if (
        typeof sourceBucket !== "string" ||
        sourceBucket.length === 0 ||
        typeof destinationBucket !== "string" ||
        destinationBucket.length === 0
      ) {
        throw new Error("LEGACY_ATTACHMENT_BUCKET_MAP must map non-empty strings");
      }

      acc[sourceBucket] = destinationBucket;
      return acc;
    },
    {},
  );

  return cachedAttachmentBucketMap;
}

export function getAttachmentBucketMap(rawMap?: string, onInvalid?: (message: string) => void) {
  try {
    return parseAttachmentBucketMap(rawMap);
  } catch (error) {
    onInvalid?.(error instanceof Error ? error.message : String(error));
    return {};
  }
}

export function resolveTargetBucket(
  sourceBucket: string,
  attachmentBucketMap: AttachmentBucketMap,
) {
  const destinationBucket = attachmentBucketMap[sourceBucket] || sourceBucket;

  return {
    sourceBucket,
    destinationBucket,
    remapped: destinationBucket !== sourceBucket,
  };
}

export function createAttachmentBucketClientFactory({
  region,
  legacyS3AccessRoleArn,
}: {
  region?: string;
  legacyS3AccessRoleArn?: string;
}) {
  const clientCache = new Map<string, Promise<S3Client>>();
  const stsClient = new STSClient({ region });

  return async (bucket: string): Promise<S3Client> => {
    const cachedClient = clientCache.get(bucket);
    if (cachedClient) {
      return cachedClient;
    }

    const clientPromise = (async () => {
      if (!isLegacyUploadBucket(bucket) || !legacyS3AccessRoleArn) {
        return new S3Client({ region });
      }

      const assumedRoleResponse = await stsClient.send(
        new AssumeRoleCommand({
          RoleArn: legacyS3AccessRoleArn,
          RoleSessionName: "AttachmentArchiveLegacyS3Access",
        }),
      );

      const assumedCredentials = assumedRoleResponse.Credentials;

      if (!assumedCredentials) {
        throw new Error("No assumed credentials returned for legacy S3 access role");
      }

      return new S3Client({
        region,
        credentials: {
          accessKeyId: assumedCredentials.AccessKeyId as string,
          secretAccessKey: assumedCredentials.SecretAccessKey as string,
          sessionToken: assumedCredentials.SessionToken,
        },
      });
    })();

    clientCache.set(bucket, clientPromise);
    return clientPromise;
  };
}
