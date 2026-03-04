import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { getDomain } from "libs/utils";

import { getStateFilter } from "../libs/api/auth/user";
import { getPackage, getPackageChangelog } from "../libs/api/package";
import { handleOpensearchError } from "./utils";

type AttachmentBucketMap = Record<string, string>;

let cachedAttachmentBucketMap: AttachmentBucketMap | undefined;
let cachedAttachmentBucketMapRaw: string | undefined;

function getAttachmentBucketMap(): AttachmentBucketMap {
  const rawMap = process.env.LEGACY_ATTACHMENT_BUCKET_MAP;

  if (
    cachedAttachmentBucketMap &&
    cachedAttachmentBucketMapRaw === (rawMap ?? "__NO_MAP_CONFIGURED__")
  ) {
    return cachedAttachmentBucketMap;
  }

  cachedAttachmentBucketMapRaw = rawMap ?? "__NO_MAP_CONFIGURED__";
  if (!rawMap) {
    cachedAttachmentBucketMap = {};
    return cachedAttachmentBucketMap;
  }

  try {
    const parsedMap: unknown = JSON.parse(rawMap);
    if (typeof parsedMap !== "object" || parsedMap === null || Array.isArray(parsedMap)) {
      throw new Error("LEGACY_ATTACHMENT_BUCKET_MAP must be a JSON object");
    }

    const attachmentBucketMap = Object.entries(parsedMap).reduce<AttachmentBucketMap>(
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

    cachedAttachmentBucketMap = attachmentBucketMap;
  } catch (error) {
    cachedAttachmentBucketMap = {};
    console.warn(
      JSON.stringify({
        event: "legacy_attachment_bucket_map_invalid",
        message: error instanceof Error ? error.message : String(error),
      }),
    );
  }

  return cachedAttachmentBucketMap;
}

function logRemapApplied({
  packageId,
  sourceBucket,
  destinationBucket,
  key,
  filename,
}: {
  packageId: string;
  sourceBucket: string;
  destinationBucket: string;
  key: string;
  filename: string;
}) {
  console.info(
    JSON.stringify({
      event: "legacy_attachment_remap_applied",
      packageId,
      sourceBucket,
      destinationBucket,
      key,
      filename,
    }),
  );
}

function logRemapMissingMapping({
  packageId,
  sourceBucket,
  key,
  filename,
}: {
  packageId: string;
  sourceBucket: string;
  key: string;
  filename: string;
}) {
  console.warn(
    JSON.stringify({
      event: "legacy_attachment_remap_missing_mapping",
      packageId,
      sourceBucket,
      key,
      filename,
    }),
  );
}

function logRemapFallback({
  packageId,
  sourceBucket,
  destinationBucket,
  key,
  filename,
  reason,
}: {
  packageId: string;
  sourceBucket: string;
  destinationBucket: string;
  key: string;
  filename: string;
  reason: string;
}) {
  console.warn(
    JSON.stringify({
      event: "legacy_attachment_remap_fallback",
      packageId,
      sourceBucket,
      destinationBucket,
      key,
      filename,
      reason,
    }),
  );
}

function resolveTargetBucket(
  packageId: string,
  sourceBucket: string,
  key: string,
  filename: string,
): { sourceBucket: string; destinationBucket: string; remapped: boolean } {
  const attachmentBucketMap = getAttachmentBucketMap();
  const mappedBucket = attachmentBucketMap[sourceBucket];

  if (mappedBucket) {
    logRemapApplied({
      packageId,
      sourceBucket,
      destinationBucket: mappedBucket,
      key,
      filename,
    });
    return {
      sourceBucket,
      destinationBucket: mappedBucket,
      remapped: true,
    };
  }

  if (sourceBucket.startsWith("uploads")) {
    logRemapMissingMapping({
      packageId,
      sourceBucket,
      key,
      filename,
    });
  }

  return {
    sourceBucket,
    destinationBucket: sourceBucket,
    remapped: false,
  };
}

// Handler function to get Seatool data
export const handler = async (event: APIGatewayEvent) => {
  try {
    getDomain();
  } catch (error) {
    return response({
      statusCode: 500,
      body: { message: `ERROR: ${error?.message || error}` },
    });
  }

  if (!event.body) {
    return response({
      statusCode: 400,
      body: { message: "Event body required" },
    });
  }

  try {
    const body = JSON.parse(event.body);

    const mainResult = await getPackage(body.id);
    if (!mainResult || !mainResult.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    const stateFilter = await getStateFilter(event);
    if (stateFilter) {
      const stateAccessAllowed = stateFilter?.terms.state.includes(
        mainResult?._source?.state?.toLocaleLowerCase() || "",
      );

      if (!stateAccessAllowed) {
        return response({
          statusCode: 403,
          body: { message: "state access not permitted for the given id" },
        });
      }
    }

    // add state
    // Do we want to check
    const changelogs = await getPackageChangelog(body.id);
    const attachmentExists = changelogs.hits.hits.some((CL) => {
      return CL._source.attachments?.some(
        (ATT) => ATT.bucket === body.bucket && ATT.key === body.key,
      );
    });
    if (!attachmentExists) {
      return response({
        statusCode: 500,
        body: {
          message: "Attachment details not found for given record id.",
        },
      });
    }

    const bucketResolution = resolveTargetBucket(body.id, body.bucket, body.key, body.filename);

    // Now we can generate the presigned url
    let url: string;
    try {
      url = await generatePresignedUrl(
        bucketResolution.destinationBucket,
        body.key,
        body.filename,
        60,
      );
    } catch (error) {
      if (!bucketResolution.remapped) {
        throw error;
      }

      logRemapFallback({
        packageId: body.id,
        sourceBucket: bucketResolution.sourceBucket,
        destinationBucket: bucketResolution.destinationBucket,
        key: body.key,
        filename: body.filename,
        reason: error instanceof Error ? error.message : String(error),
      });
      url = await generatePresignedUrl(bucketResolution.sourceBucket, body.key, body.filename, 60);
    }

    return response<unknown>({
      statusCode: 200,
      body: { url },
    });
  } catch (error) {
    return response(handleOpensearchError(error));
  }
};

async function getClient(bucket: string) {
  if (bucket.startsWith("uploads")) {
    const stsClient = new STSClient({ region: process.env.region });

    // Assume the role
    const assumedRoleResponse = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: process.env.legacyS3AccessRoleArn,
        RoleSessionName: "AssumedRoleSession",
      }),
    );

    // Extract the assumed role credentials
    const assumedCredentials = assumedRoleResponse.Credentials;

    if (!assumedCredentials) {
      throw new Error("No assumed credentials");
    }

    // Create S3 client using the assumed role's credentials
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

//TODO: add check for resource before signing URL
async function generatePresignedUrl(
  bucket: string,
  key: string,
  filename: string,
  expirationInSeconds: number,
) {
  // Get an S3 client
  const client = await getClient(bucket);

  // Create a command to get the object (you can adjust this according to your use case)
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: `filename ="${filename}"`,
  });

  // Generate a presigned URL
  const presignedUrl = await getSignedUrl(client, getObjectCommand, {
    expiresIn: expirationInSeconds,
  });

  return presignedUrl;
}
