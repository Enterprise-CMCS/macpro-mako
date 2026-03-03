import { APIGatewayProxyEvent } from "aws-lambda";
import { response } from "libs/handler-lib";

import {
  getActiveClient,
  getExternalApiAuthConfig,
  isClientAllowedForObject,
} from "./external-auth";
import { generatePresignedDownloadUrl, isS3ObjectAccessError } from "./presignedAttachmentUrl";

const DEFAULT_EXPIRATION_SECONDS = 60;
const MAX_EXPIRATION_SECONDS = 604800;

type AttachmentRequestBody = {
  bucket?: unknown;
  key?: unknown;
  objectName?: unknown;
  filename?: unknown;
  fileName?: unknown;
  expiresIn?: unknown;
};

type ParsedAttachmentRequest = {
  bucket: string;
  key: string;
  filename: string;
  expiresIn: number;
};

function badRequest(message: string) {
  return response({
    statusCode: 400,
    body: { message },
  });
}

function defaultFilenameFromKey(key: string): string {
  const normalizedKey = key.replace(/\/+$/, "");
  const keySegments = normalizedKey.split("/");
  return keySegments[keySegments.length - 1] || normalizedKey;
}

function parseRequestBody(
  event: APIGatewayProxyEvent,
): ParsedAttachmentRequest | ReturnType<typeof badRequest> {
  if (!event.body) {
    return badRequest("Request body is required.");
  }

  let body: AttachmentRequestBody;
  try {
    body = JSON.parse(event.body);
  } catch {
    return badRequest("Invalid JSON payload.");
  }

  if (typeof body.bucket !== "string" || body.bucket.trim() === "") {
    return badRequest("bucket is required.");
  }

  const keyCandidate = body.key ?? body.objectName ?? body.filename ?? body.fileName;
  if (typeof keyCandidate !== "string" || keyCandidate.trim() === "") {
    return badRequest("key is required.");
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

  let expiresIn = DEFAULT_EXPIRATION_SECONDS;
  if (body.expiresIn !== undefined) {
    if (
      typeof body.expiresIn !== "number" ||
      !Number.isInteger(body.expiresIn) ||
      body.expiresIn < 1 ||
      body.expiresIn > MAX_EXPIRATION_SECONDS
    ) {
      return badRequest(`expiresIn must be an integer between 1 and ${MAX_EXPIRATION_SECONDS}.`);
    }
    expiresIn = body.expiresIn;
  }

  return {
    bucket: body.bucket.trim(),
    key: normalizedKey,
    filename,
    expiresIn,
  };
}

function getClientIdFromAuthorizer(event: APIGatewayProxyEvent): string | null {
  const authorizer = event.requestContext.authorizer;
  if (!authorizer || typeof authorizer !== "object") {
    return null;
  }

  const clientId = (authorizer as Record<string, unknown>).clientId;
  return typeof clientId === "string" && clientId.trim() ? clientId : null;
}

function isParsedRequestResponse(
  value: ParsedAttachmentRequest | ReturnType<typeof badRequest>,
): value is ReturnType<typeof badRequest> {
  return (value as ReturnType<typeof badRequest>).statusCode !== undefined;
}

export const handler = async (event: APIGatewayProxyEvent) => {
  const parsedRequest = parseRequestBody(event);
  if (isParsedRequestResponse(parsedRequest)) {
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

    return response({
      statusCode: 500,
      body: { message: "Internal server error." },
    });
  }
};
