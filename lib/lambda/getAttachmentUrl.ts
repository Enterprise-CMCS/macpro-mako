import {
  GetObjectCommand,
  GetObjectTaggingCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { APIGatewayEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { getDomain } from "libs/utils";
import { SEATOOL_STATUS } from "shared-types";
import { getDraftAttachments } from "shared-utils";

import {
  getAttachmentErrorMessage,
  isAttachmentAccessDeniedError,
  isAttachmentNotFoundError,
  isLegacyAttachmentUnavailableError,
} from "../attachment-archive/attachment-errors";
import {
  getAttachmentBucketMap,
  resolveTargetBucket as resolveMappedBucket,
} from "../attachment-archive/bucket-routing";
import {
  isNonCleanVirusScanStatus,
  VIRUS_SCAN_STATUS_TAG_KEY,
} from "../attachment-archive/file-scan-status";
import { getSearchUserScope as getAttachmentSearchUserScope } from "../libs/api/auth/user";
import { getDraftPackage, getPackage, getPackageChangelog } from "../libs/api/package";
import {
  isActiveDraftPackage,
  isActiveMainNonDraftPackage,
} from "../libs/api/package/packageStatus";
import { buildResponseContentDisposition } from "./presignedAttachmentUrl";
import { handleOpensearchError } from "./utils";

const isLegacyUploadBucket = (bucket: string) => bucket.startsWith("uploads");

function createAttachmentUrlClientFactory({
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
          RoleSessionName: "AttachmentUrlLegacyS3Access",
        }),
      );

      const assumedCredentials = assumedRoleResponse.Credentials;
      const accessKeyId = assumedCredentials?.AccessKeyId;
      const secretAccessKey = assumedCredentials?.SecretAccessKey;

      if (!accessKeyId || !secretAccessKey) {
        throw new Error("No assumed credentials returned for legacy S3 access role");
      }

      return new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
          sessionToken: assumedCredentials.SessionToken,
        },
      });
    })();

    clientCache.set(bucket, clientPromise);
    return clientPromise;
  };
}

const getClient = createAttachmentUrlClientFactory({
  region: process.env.region || process.env.AWS_REGION,
  legacyS3AccessRoleArn: process.env.legacyS3AccessRoleArn,
});

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
  const command = new GetObjectTaggingCommand({
    Bucket: bucket,
    Key: key,
  });
  const taggingResponse = await client.send(command);

  return (taggingResponse.TagSet || []).reduce<Record<string, string>>((acc, tag) => {
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
    const normalizedId = typeof body.id === "string" ? body.id.trim().toUpperCase() : "";
    if (!normalizedId) {
      return response({
        statusCode: 400,
        body: { message: "Valid id is required" },
      });
    }

    const { stateFilter, canViewDrafts } = await getAttachmentSearchUserScope(event);
    if (stateFilter === false) {
      return response({
        statusCode: 403,
        body: { message: "state access not permitted for the given id" },
      });
    }

    const mainResult = await getPackage(normalizedId);
    const hasActiveMainNonDraft = isActiveMainNonDraftPackage(mainResult);
    const draftResult = await getDraftPackage(normalizedId);
    const hasActiveDraft = isActiveDraftPackage(draftResult);

    const canAccessDraft = hasActiveDraft && (stateFilter !== null || canViewDrafts);
    const resolvedResult =
      body.preferDraft === true && canAccessDraft
        ? draftResult
        : hasActiveMainNonDraft
          ? mainResult
          : canAccessDraft
            ? draftResult
            : undefined;

    if (!resolvedResult || !resolvedResult.found) {
      return response({
        statusCode: 404,
        body: { message: "No record found for the given id" },
      });
    }

    if (stateFilter) {
      const stateAccessAllowed = stateFilter.terms.state.includes(
        resolvedResult._source?.state?.toLocaleLowerCase() || "",
      );

      if (!stateAccessAllowed) {
        return response({
          statusCode: 403,
          body: { message: "state access not permitted for the given id" },
        });
      }
    }

    const isDraftResult = resolvedResult._source?.seatoolStatus === SEATOOL_STATUS.DRAFT;
    const attachmentExists = isDraftResult
      ? getDraftAttachments(resolvedResult._source).some(
          (attachment) => attachment.bucket === body.bucket && attachment.key === body.key,
        )
      : (await getPackageChangelog(normalizedId)).hits.hits.some((changelogItem) =>
          changelogItem._source.attachments?.some(
            (attachment) => attachment.bucket === body.bucket && attachment.key === body.key,
          ),
        );

    if (!attachmentExists) {
      return response({
        statusCode: 500,
        body: {
          message: "Attachment details not found for given record id.",
        },
      });
    }

    const bucketResolution = resolveTargetBucket(
      normalizedId,
      body.bucket,
      body.key,
      body.filename,
    );
    const bucketToSign = await resolveDownloadBucket({
      packageId: normalizedId,
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
