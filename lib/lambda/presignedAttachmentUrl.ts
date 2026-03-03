import { GetObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const LEGACY_BUCKET_PREFIX = "uploads";

type S3ErrorLike = Error & {
  $metadata?: {
    httpStatusCode?: number;
  };
  Code?: string;
  code?: string;
};

export type PresignedDownloadUrlOptions = {
  validateObjectAccess?: boolean;
};

export class S3ObjectAccessError extends Error {
  readonly kind = "S3_OBJECT_ACCESS";
  readonly s3Status: 403 | 404;

  constructor(s3Status: 403 | 404, message: string, cause?: unknown) {
    super(message);
    this.name = "S3ObjectAccessError";
    this.s3Status = s3Status;
    if (cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = cause;
    }
  }
}

export function isS3ObjectAccessError(error: unknown): error is S3ObjectAccessError {
  if (error instanceof S3ObjectAccessError) {
    return true;
  }

  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as { kind?: string; s3Status?: number };
  return candidate.kind === "S3_OBJECT_ACCESS" && [403, 404].includes(candidate.s3Status || 0);
}

function mapS3ObjectAccessError(
  error: unknown,
  bucket: string,
  key: string,
): S3ObjectAccessError | null {
  const s3Error = error as S3ErrorLike;
  const statusCode = s3Error?.$metadata?.httpStatusCode;
  const code = s3Error?.name || s3Error?.Code || s3Error?.code;

  if (statusCode === 403 || code === "AccessDenied" || code === "Forbidden") {
    return new S3ObjectAccessError(403, `Access denied for s3://${bucket}/${key}`, error);
  }

  if (statusCode === 404 || code === "NotFound" || code === "NoSuchKey") {
    return new S3ObjectAccessError(404, `Object not found at s3://${bucket}/${key}`, error);
  }

  return null;
}

async function getClientForBucket(bucket: string): Promise<S3Client> {
  if (bucket.startsWith(LEGACY_BUCKET_PREFIX)) {
    const stsClient = new STSClient({ region: process.env.region });
    const assumedRoleResponse = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: process.env.legacyS3AccessRoleArn,
        RoleSessionName: "AssumedRoleSession",
      }),
    );

    const assumedCredentials = assumedRoleResponse.Credentials;
    if (!assumedCredentials) {
      throw new Error("No assumed credentials");
    }

    return new S3Client({
      credentials: {
        accessKeyId: assumedCredentials.AccessKeyId as string,
        secretAccessKey: assumedCredentials.SecretAccessKey as string,
        sessionToken: assumedCredentials.SessionToken,
      },
    });
  }

  return new S3Client({});
}

async function validateObjectAccess(client: S3Client, bucket: string, key: string): Promise<void> {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch (error) {
    const mappedError = mapS3ObjectAccessError(error, bucket, key);
    if (mappedError) {
      throw mappedError;
    }
    throw error;
  }
}

export async function generatePresignedDownloadUrl(
  bucket: string,
  key: string,
  filename: string,
  expirationInSeconds: number,
  options?: PresignedDownloadUrlOptions,
): Promise<string> {
  const client = await getClientForBucket(bucket);
  if (options?.validateObjectAccess) {
    await validateObjectAccess(client, bucket, key);
  }

  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: `filename ="${filename}"`,
  });

  return getSignedUrl(client, getObjectCommand, {
    expiresIn: expirationInSeconds,
  });
}
