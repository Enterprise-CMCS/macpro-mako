import { GetObjectCommand, GetObjectTaggingCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { getDomain } from "libs/utils";

import {
  getAttachmentErrorMessage,
  isAttachmentAccessDeniedError,
  isAttachmentNotFoundError,
  isLegacyAttachmentUnavailableError,
} from "../attachment-archive/attachment-errors";
import {
  isNonCleanVirusScanStatus,
  VIRUS_SCAN_STATUS_TAG_KEY,
} from "../attachment-archive/file-scan-status";
import {
  createAttachmentBucketClientFactory,
  getAttachmentBucketMap,
  resolveTargetBucket as resolveMappedBucket,
} from "../attachment-archive/bucket-routing";
import { getStateFilter } from "../libs/api/auth/user";
import { getPackage, getPackageChangelog } from "../libs/api/package";
import { handleOpensearchError } from "./utils";

function getClient(bucket: string) {
  return createAttachmentBucketClientFactory({
    region: process.env.region || process.env.AWS_REGION,
    legacyS3AccessRoleArn: process.env.legacyS3AccessRoleArn,
  })(bucket);
}

class AttachmentUnavailableError extends Error {
  statusCode = 410;

  constructor(message: string) {
    super(message);
    this.name = "AttachmentUnavailableError";
  }
}

class AttachmentBlockedByScanError extends Error {
  statusCode = 409;

  constructor(message: string) {
    super(message);
    this.name = "AttachmentBlockedByScanError";
  }
}

const BLOCKED_BY_SCAN_MESSAGE =
  "Unable to download this attachment because file scanning did not complete successfully.";

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

function logAttachmentUnavailable({
  packageId,
  sourceBucket,
  destinationBucket,
  key,
  filename,
  reason,
}: {
  packageId: string;
  sourceBucket: string;
  destinationBucket?: string;
  key: string;
  filename: string;
  reason: string;
}) {
  console.warn(
    JSON.stringify({
      event: "legacy_attachment_unavailable",
      packageId,
      sourceBucket,
      destinationBucket,
      key,
      filename,
      reason,
    }),
  );
}

function logAttachmentBlockedByScan({
  packageId,
  bucket,
  key,
  filename,
  virusScanStatus,
}: {
  packageId: string;
  bucket: string;
  key: string;
  filename: string;
  virusScanStatus?: string;
}) {
  console.warn(
    JSON.stringify({
      event: "attachment_blocked_by_scan",
      packageId,
      bucket,
      key,
      filename,
      virusScanStatus,
    }),
  );
}

async function getAttachmentObjectTags(
  bucket: string,
  key: string,
): Promise<Record<string, string>> {
  const client = await getClient(bucket);
  const response = await client.send(
    new GetObjectTaggingCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  return (response.TagSet || []).reduce<Record<string, string>>((acc, tag) => {
    if (tag.Key && tag.Value) {
      acc[tag.Key] = tag.Value;
    }

    return acc;
  }, {});
}

async function isBlockedByFileScan({
  packageId,
  bucket,
  key,
  filename,
  error,
}: {
  packageId: string;
  bucket: string;
  key: string;
  filename: string;
  error: unknown;
}): Promise<boolean> {
  if (!isAttachmentAccessDeniedError(error)) {
    return false;
  }

  try {
    const tags = await getAttachmentObjectTags(bucket, key);
    const virusScanStatus = tags[VIRUS_SCAN_STATUS_TAG_KEY];
    if (!isNonCleanVirusScanStatus(virusScanStatus)) {
      return false;
    }

    logAttachmentBlockedByScan({
      packageId,
      bucket,
      key,
      filename,
      virusScanStatus,
    });
    return true;
  } catch (tagError) {
    console.warn(
      JSON.stringify({
        event: "attachment_scan_tag_lookup_failed",
        packageId,
        bucket,
        key,
        filename,
        message: tagError instanceof Error ? tagError.message : String(tagError),
      }),
    );
    return false;
  }
}

function resolveTargetBucket(
  packageId: string,
  sourceBucket: string,
  key: string,
  filename: string,
): { sourceBucket: string; destinationBucket: string; remapped: boolean } {
  const attachmentBucketMap = getAttachmentBucketMap(
    process.env.LEGACY_ATTACHMENT_BUCKET_MAP,
    (message) =>
      console.warn(
        JSON.stringify({
          event: "legacy_attachment_bucket_map_invalid",
          message,
        }),
      ),
  );
  const bucketResolution = resolveMappedBucket(sourceBucket, attachmentBucketMap);

  if (bucketResolution.remapped) {
    logRemapApplied({
      packageId,
      sourceBucket,
      destinationBucket: bucketResolution.destinationBucket,
      key,
      filename,
    });
    return bucketResolution;
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
    sourceBucket: bucketResolution.sourceBucket,
    destinationBucket: bucketResolution.destinationBucket,
    remapped: bucketResolution.remapped,
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
    const bucketToSign = await resolveDownloadBucket({
      packageId: body.id,
      sourceBucket: bucketResolution.sourceBucket,
      destinationBucket: bucketResolution.destinationBucket,
      remapped: bucketResolution.remapped,
      key: body.key,
      filename: body.filename,
    });

    // Now we can generate the presigned url
    const url = await generatePresignedUrl(bucketToSign, body.key, body.filename, 60);

    return response<unknown>({
      statusCode: 200,
      body: { url },
    });
  } catch (error) {
    if (error instanceof AttachmentUnavailableError) {
      return response({
        statusCode: error.statusCode,
        body: { message: error.message },
      });
    }
    if (error instanceof AttachmentBlockedByScanError) {
      return response({
        statusCode: error.statusCode,
        body: { message: error.message },
      });
    }

    return response(handleOpensearchError(error));
  }
};

async function resolveDownloadBucket({
  packageId,
  sourceBucket,
  destinationBucket,
  remapped,
  key,
  filename,
}: {
  packageId: string;
  sourceBucket: string;
  destinationBucket: string;
  remapped: boolean;
  key: string;
  filename: string;
}) {
  if (remapped) {
    try {
      await assertObjectAccessible(destinationBucket, key);
      return destinationBucket;
    } catch (error) {
      if (
        await isBlockedByFileScan({
          packageId,
          bucket: destinationBucket,
          key,
          filename,
          error,
        })
      ) {
        throw new AttachmentBlockedByScanError(BLOCKED_BY_SCAN_MESSAGE);
      }

      if (!isAttachmentNotFoundError(error)) {
        throw error;
      }

      logRemapFallback({
        packageId,
        sourceBucket,
        destinationBucket,
        key,
        filename,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  try {
    await assertObjectAccessible(sourceBucket, key);
    return sourceBucket;
  } catch (error) {
    if (
      await isBlockedByFileScan({
        packageId,
        bucket: sourceBucket,
        key,
        filename,
        error,
      })
    ) {
      throw new AttachmentBlockedByScanError(BLOCKED_BY_SCAN_MESSAGE);
    }

    const attachmentUnavailable =
      isAttachmentNotFoundError(error) || isLegacyAttachmentUnavailableError(sourceBucket, error);

    if (!attachmentUnavailable) {
      throw error;
    }

    logAttachmentUnavailable({
      packageId,
      sourceBucket,
      destinationBucket: remapped ? destinationBucket : undefined,
      key,
      filename,
      reason: getAttachmentErrorMessage(error),
    });

    throw new AttachmentUnavailableError("This attachment is no longer available.");
  }
}

async function assertObjectAccessible(bucket: string, key: string) {
  const client = await getClient(bucket);
  await client.send(
    new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

function getAsciiFilename(filename: string) {
  const sanitized = filename
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]+/g, "_")
    .replace(/["\\]/g, "_")
    .trim();

  return sanitized || "download";
}

function encodeContentDispositionFilename(filename: string) {
  return encodeURIComponent(filename).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function buildResponseContentDisposition(filename: string) {
  const asciiFilename = getAsciiFilename(filename);
  const encodedFilename = encodeContentDispositionFilename(filename);

  return `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`;
}

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
    ResponseContentDisposition: buildResponseContentDisposition(filename),
  });

  // Generate a presigned URL
  const presignedUrl = await getSignedUrl(client, getObjectCommand, {
    expiresIn: expirationInSeconds,
  });

  return presignedUrl;
}
