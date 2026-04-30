import { APIGatewayProxyEvent } from "aws-lambda";
import { response } from "libs/handler-lib";
import { opensearch } from "shared-types";

import { sendAttachmentArchiveRebuildRequest } from "../attachment-archive/rebuild-queue";
import { getPackage, getPackageChangelog } from "../libs/api/package";
import { getRequestedAttachmentArchiveDownload } from "./attachmentArchive-lib";
import {
  getActiveClient,
  getExternalApiAuthConfig,
  isClientAllowedForObject,
} from "./external-auth";
import { generatePresignedDownloadUrl, isS3ObjectAccessError } from "./presignedAttachmentUrl";

const DEFAULT_EXPIRATION_SECONDS = 60;
const MAX_EXPIRATION_SECONDS = 604800;
const DEFAULT_ARCHIVE_ERROR_MESSAGE = "Unable to prepare the attachment archive.";

type AttachmentRequestBody = {
  bucket?: unknown;
  key?: unknown;
  objectName?: unknown;
  filename?: unknown;
  fileName?: unknown;
  expiresIn?: unknown;
  packageId?: unknown;
  sectionId?: unknown;
  section?: unknown;
};

type ParsedObjectRequest = {
  mode: "object";
  bucket: string;
  key: string;
  filename: string;
  expiresIn: number;
};

type ParsedArchiveRequest = {
  mode: "archive";
  expiresIn: number;
  packageId: string;
  sectionId?: string;
};

type ParsedRequest = ParsedObjectRequest | ParsedArchiveRequest;

type ErrorResponse = ReturnType<typeof badRequest>;

function badRequest(message: string) {
  return response({
    statusCode: 400,
    body: { message },
  });
}

function defaultFilenameFromKey(key: string) {
  const normalizedKey = key.replace(/\/+$/, "");
  const keySegments = normalizedKey.split("/");
  return keySegments[keySegments.length - 1] || normalizedKey;
}

function parseExpiresIn(expiresIn: unknown): number | ErrorResponse {
  if (expiresIn === undefined) {
    return DEFAULT_EXPIRATION_SECONDS;
  }

  if (
    typeof expiresIn !== "number" ||
    !Number.isInteger(expiresIn) ||
    expiresIn < 1 ||
    expiresIn > MAX_EXPIRATION_SECONDS
  ) {
    return badRequest(`expiresIn must be an integer between 1 and ${MAX_EXPIRATION_SECONDS}.`);
  }

  return expiresIn;
}

function parseOptionalSectionId(body: AttachmentRequestBody): string | undefined | ErrorResponse {
  const rawSectionId = body.sectionId;
  const rawSection = body.section;

  if (rawSectionId !== undefined && rawSection !== undefined && rawSectionId !== rawSection) {
    return badRequest("section and sectionId must match when both are provided.");
  }

  const sectionValue = rawSectionId ?? rawSection;
  if (sectionValue === undefined) {
    return undefined;
  }

  if (typeof sectionValue !== "string" || sectionValue.trim() === "") {
    return badRequest("sectionId must be a non-empty string when provided.");
  }

  return sectionValue.trim();
}

function isObjectLocatorFieldPresent(body: AttachmentRequestBody): boolean {
  return [body.bucket, body.key, body.objectName, body.filename, body.fileName].some(
    (value) => value !== undefined,
  );
}

function parseObjectRequest(body: AttachmentRequestBody): ParsedObjectRequest | ErrorResponse {
  if (typeof body.bucket !== "string" || body.bucket.trim() === "") {
    return badRequest("bucket is required.");
  }

  const keyCandidate = body.key ?? body.objectName ?? body.filename ?? body.fileName;
  if (typeof keyCandidate !== "string" || keyCandidate.trim() === "") {
    return badRequest("key is required.");
  }

  const expiresIn = parseExpiresIn(body.expiresIn);
  if (isErrorResponse(expiresIn)) {
    return expiresIn;
  }

  const normalizedKey = keyCandidate.trim();
  const rawFilename = body.filename ?? body.fileName;
  let filename = defaultFilenameFromKey(normalizedKey);
  if (rawFilename !== undefined) {
    if (typeof rawFilename !== "string" || rawFilename.trim() === "") {
      return badRequest("filename must be a non-empty string when provided.");
    }
    filename = rawFilename.trim();
  }

  return {
    mode: "object",
    bucket: body.bucket.trim(),
    key: normalizedKey,
    filename,
    expiresIn,
  };
}

function parseArchiveRequest(
  body: AttachmentRequestBody,
  sectionId: string | undefined,
): ParsedArchiveRequest | ErrorResponse {
  if (typeof body.packageId !== "string" || body.packageId.trim() === "") {
    return badRequest("packageId is required when requesting an archive.");
  }

  const expiresIn = parseExpiresIn(body.expiresIn);
  if (isErrorResponse(expiresIn)) {
    return expiresIn;
  }

  return {
    mode: "archive",
    expiresIn,
    packageId: body.packageId.trim(),
    ...(sectionId ? { sectionId } : {}),
  };
}

function parseRequestBody(event: APIGatewayProxyEvent): ParsedRequest | ErrorResponse {
  if (!event.body) {
    return badRequest("Request body is required.");
  }

  let body: AttachmentRequestBody;
  try {
    body = JSON.parse(event.body);
  } catch {
    return badRequest("Invalid JSON payload.");
  }

  const sectionId = parseOptionalSectionId(body);
  if (isErrorResponse(sectionId)) {
    return sectionId;
  }

  if (isObjectLocatorFieldPresent(body)) {
    if (sectionId) {
      return badRequest("sectionId cannot be combined with bucket/key attachment requests.");
    }

    return parseObjectRequest(body);
  }

  return parseArchiveRequest(body, sectionId);
}

function getClientIdFromAuthorizer(event: APIGatewayProxyEvent): string | null {
  const authorizer = event.requestContext.authorizer;
  if (!authorizer || typeof authorizer !== "object") {
    return null;
  }

  const clientId = (authorizer as Record<string, unknown>).clientId;
  return typeof clientId === "string" && clientId.trim() ? clientId : null;
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "statusCode" in value &&
    typeof (value as { statusCode?: unknown }).statusCode === "number"
  );
}

function getLatestChangelogTimestamp(changelog: Array<{ _source?: { timestamp?: number } }>) {
  return changelog.reduce<number | undefined>((latest, item) => {
    const timestamp = item._source?.timestamp;
    if (typeof timestamp !== "number") {
      return latest;
    }

    return latest === undefined ? timestamp : Math.max(latest, timestamp);
  }, undefined);
}

function getKnownErrorResponse(error: unknown) {
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : undefined;

  if (!statusCode) {
    return undefined;
  }

  const rawMessage =
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : undefined;

  if (!rawMessage) {
    return response({
      statusCode,
      body: { message: "Request failed." },
    });
  }

  try {
    const parsed = JSON.parse(rawMessage) as { message?: string };
    if (typeof parsed.message === "string" && parsed.message) {
      return response({
        statusCode,
        body: { message: parsed.message },
      });
    }
  } catch {
    // Fall through to use the raw message.
  }

  return response({
    statusCode,
    body: { message: rawMessage },
  });
}

async function handleArchiveRequest({
  client,
  request,
}: {
  client: NonNullable<ReturnType<typeof getActiveClient>>;
  request: ParsedArchiveRequest;
}) {
  const mainResult = await getPackage(request.packageId);
  if (!mainResult || !mainResult.found) {
    return response({
      statusCode: 404,
      body: { message: "No record found for the given packageId" },
    });
  }

  const changelogResponse = await getPackageChangelog(request.packageId);
  const changelog = changelogResponse.hits.hits as opensearch.changelog.ItemResult[];
  const archiveResult = await getRequestedAttachmentArchiveDownload({
    packageId: request.packageId,
    scope: request.sectionId ? "section" : "all",
    sectionId: request.sectionId,
    changelog,
  });

  if (archiveResult.response.status === "FAILED") {
    return response({
      statusCode: 409,
      body: {
        message: archiveResult.response.message || DEFAULT_ARCHIVE_ERROR_MESSAGE,
      },
    });
  }

  if (archiveResult.response.status === "PENDING") {
    if (archiveResult.needsRebuild) {
      await sendAttachmentArchiveRebuildRequest({
        packageId: request.packageId,
        latestTimestamp: getLatestChangelogTimestamp(changelog),
        source: "request",
      });
    }

    return response({
      statusCode: 200,
      body: {
        status: "PENDING",
        pollAfterSeconds: archiveResult.response.pollAfterSeconds,
        packageId: request.packageId,
        ...(request.sectionId ? { sectionId: request.sectionId } : {}),
      },
    });
  }

  if (
    !isClientAllowedForObject(
      client,
      archiveResult.response.bucketName,
      archiveResult.response.artifactKey,
    )
  ) {
    return response({
      statusCode: 403,
      body: { message: "Client is not allowed to access the requested object." },
    });
  }

  const url = await generatePresignedDownloadUrl(
    archiveResult.response.bucketName,
    archiveResult.response.artifactKey,
    archiveResult.response.filename,
    request.expiresIn,
    {
      validateObjectAccess: true,
    },
  );

  return response({
    statusCode: 200,
    body: {
      status: "READY",
      target: request.sectionId ? "sectionArchive" : "packageArchive",
      filename: archiveResult.response.filename,
      url,
      expiresIn: request.expiresIn,
      ...(archiveResult.response.warningMessage
        ? { warningMessage: archiveResult.response.warningMessage }
        : {}),
    },
  });
}

export const handler = async (event: APIGatewayProxyEvent) => {
  const parsedRequest = parseRequestBody(event);
  if (isErrorResponse(parsedRequest)) {
    return parsedRequest;
  }

  const clientId = getClientIdFromAuthorizer(event);
  if (!clientId) {
    return response({
      statusCode: 401,
      body: { message: "Unauthorized" },
    });
  }

  try {
    const config = await getExternalApiAuthConfig();
    const client = getActiveClient(config, clientId);

    if (!client || !client.grants.includes("client_credentials")) {
      return response({
        statusCode: 403,
        body: { message: "Client is not authorized for this endpoint." },
      });
    }

    if (parsedRequest.mode === "archive") {
      return await handleArchiveRequest({
        client,
        request: parsedRequest,
      });
    }

    if (!isClientAllowedForObject(client, parsedRequest.bucket, parsedRequest.key)) {
      return response({
        statusCode: 403,
        body: { message: "Client is not allowed to access the requested object." },
      });
    }

    const url = await generatePresignedDownloadUrl(
      parsedRequest.bucket,
      parsedRequest.key,
      parsedRequest.filename,
      parsedRequest.expiresIn,
      {
        validateObjectAccess: true,
      },
    );

    return response({
      statusCode: 200,
      body: {
        status: "READY",
        target: "object",
        filename: parsedRequest.filename,
        url,
        expiresIn: parsedRequest.expiresIn,
      },
    });
  } catch (error) {
    if (isS3ObjectAccessError(error)) {
      if (error.s3Status === 403) {
        return response({
          statusCode: 403,
          body: { message: "Access to the requested S3 object is denied." },
        });
      }

      if (error.s3Status === 404) {
        return response({
          statusCode: 404,
          body: { message: "Requested S3 object was not found." },
        });
      }
    }

    const knownErrorResponse = getKnownErrorResponse(error);
    if (knownErrorResponse) {
      return knownErrorResponse;
    }

    return response({
      statusCode: 500,
      body: { message: "Internal server error." },
    });
  }
};
