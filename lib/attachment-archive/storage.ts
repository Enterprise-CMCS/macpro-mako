import {
  GetObjectCommand,
  HeadObjectCommand,
  NoSuchKey,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

type S3LikeClient = {
  send(command: unknown): Promise<any>;
};

function isNotFoundError(error: unknown): boolean {
  if (error instanceof NoSuchKey) {
    return true;
  }

  const statusCode = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata
    ?.httpStatusCode;
  const errorName = (error as { name?: string })?.name;

  return statusCode === 404 || errorName === "NotFound" || errorName === "NoSuchKey";
}

export async function getObjectText({
  client,
  bucket,
  key,
}: {
  client: S3LikeClient;
  bucket: string;
  key: string;
}): Promise<string | undefined> {
  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    if (!response.Body) {
      return undefined;
    }

    return await response.Body.transformToString();
  } catch (error) {
    if (isNotFoundError(error)) {
      return undefined;
    }

    throw error;
  }
}

export async function getJsonObject<T>({
  client,
  bucket,
  key,
}: {
  client: S3LikeClient;
  bucket: string;
  key: string;
}): Promise<T | undefined> {
  const value = await getObjectText({ client, bucket, key });

  if (!value) {
    return undefined;
  }

  return JSON.parse(value) as T;
}

export async function putJsonObject({
  client,
  bucket,
  key,
  body,
}: {
  client: S3LikeClient;
  bucket: string;
  key: string;
  body: unknown;
}): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(body),
      ContentType: "application/json",
    }),
  );
}

export async function objectExists({
  client,
  bucket,
  key,
}: {
  client: S3LikeClient;
  bucket: string;
  key: string;
}): Promise<boolean> {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return true;
  } catch (error) {
    if (isNotFoundError(error)) {
      return false;
    }

    throw error;
  }
}
