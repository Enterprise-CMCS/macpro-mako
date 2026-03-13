const SKIPPABLE_ERROR_NAMES = new Set([
  "AccessDenied",
  "ExpiredToken",
  "Forbidden",
  "InvalidAccessKeyId",
  "NoSuchBucket",
  "NoSuchKey",
  "NotFound",
  "PermanentRedirect",
]);

const SKIPPABLE_MESSAGE_FRAGMENTS = [
  "Access Denied",
  "does not exist",
  "ExpiredToken",
  "Forbidden",
  "NoSuchBucket",
  "NoSuchKey",
  "not found",
  "The specified bucket does not exist",
  "The specified key does not exist",
];

export function getAttachmentErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function isSkippableAttachmentError(error: unknown) {
  const message = getAttachmentErrorMessage(error);
  const normalizedMessage = message.toLowerCase();
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

  let skippable = false;
  let reason = "";

  if (statusCode === 403 || statusCode === 404) {
    skippable = true;
    reason = `HTTP status ${statusCode}`;
  } else if (SKIPPABLE_ERROR_NAMES.has(errorName)) {
    skippable = true;
    reason = `error name "${errorName}"`;
  } else if (
    SKIPPABLE_MESSAGE_FRAGMENTS.some((fragment) =>
      normalizedMessage.includes(fragment.toLowerCase()),
    )
  ) {
    skippable = true;
    reason = "message matched skippable fragment";
  }

  if (skippable) {
    console.warn("[SKIPPED_ATTACHMENT_ERROR]", {
      reason,
      errorName: errorName || undefined,
      statusCode,
      message,
    });
  }

  return skippable;
}
