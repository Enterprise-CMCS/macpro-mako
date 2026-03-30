import { isLegacyUploadBucket } from "./bucket-routing";

const NOT_FOUND_ERROR_NAMES = new Set(["NoSuchBucket", "NoSuchKey", "NotFound"]);
const ACCESS_DENIED_ERROR_NAMES = new Set(["AccessDenied", "Forbidden", "InvalidAccessKeyId"]);

const NOT_FOUND_MESSAGE_FRAGMENTS = [
  "does not exist",
  "NoSuchBucket",
  "NoSuchKey",
  "not found",
  "The specified bucket does not exist",
  "The specified key does not exist",
];

type AttachmentErrorInfo = {
  errorName: string;
  message: string;
  statusCode?: number;
};

export function getAttachmentErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function getAttachmentErrorInfo(error: unknown): AttachmentErrorInfo {
  const message = getAttachmentErrorMessage(error);
  const errorName =
    (typeof error === "object" &&
      error &&
      ("name" in error || "Code" in error || "code" in error) &&
      String((error as any).name || (error as any).Code || (error as any).code)) ||
    "";
  const statusCode =
    typeof error === "object" &&
    error &&
    "$metadata" in error &&
    (error as any).$metadata &&
    typeof (error as any).$metadata === "object" &&
    "httpStatusCode" in (error as any).$metadata
      ? (error as any).$metadata.httpStatusCode
      : undefined;

  return {
    errorName,
    message,
    statusCode,
  };
}

function logAttachmentErrorClassification(
  label: string,
  info: AttachmentErrorInfo,
  bucket?: string,
) {
  console.warn(`[${label}]`, {
    bucket,
    errorName: info.errorName || undefined,
    statusCode: info.statusCode,
    message: info.message,
  });
}

export function isAttachmentNotFoundError(error: unknown) {
  const info = getAttachmentErrorInfo(error);
  const normalizedMessage = info.message.toLowerCase();

  const notFound =
    info.statusCode === 404 ||
    NOT_FOUND_ERROR_NAMES.has(info.errorName) ||
    NOT_FOUND_MESSAGE_FRAGMENTS.some((fragment) =>
      normalizedMessage.includes(fragment.toLowerCase()),
    );

  if (notFound) {
    logAttachmentErrorClassification("MISSING_ATTACHMENT_ERROR", info);
  }

  return notFound;
}

export function isAttachmentAccessDeniedError(error: unknown) {
  const info = getAttachmentErrorInfo(error);
  const normalizedMessage = info.message.toLowerCase();

  const accessDenied =
    info.statusCode === 403 ||
    ACCESS_DENIED_ERROR_NAMES.has(info.errorName) ||
    normalizedMessage.includes("access denied") ||
    normalizedMessage.includes("forbidden");

  if (accessDenied) {
    logAttachmentErrorClassification("ACCESS_DENIED_ATTACHMENT_ERROR", info);
  }

  return accessDenied;
}

export function isLegacyAttachmentUnavailableError(bucket: string, error: unknown) {
  if (!isLegacyUploadBucket(bucket)) {
    return false;
  }

  const unavailable = isAttachmentNotFoundError(error) || isAttachmentAccessDeniedError(error);
  if (unavailable) {
    const info = getAttachmentErrorInfo(error);
    logAttachmentErrorClassification("LEGACY_ATTACHMENT_UNAVAILABLE", info, bucket);
  }

  return unavailable;
}
