import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendRawEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { randomUUID } from "crypto";
import { getSecret } from "shared-utils";

import {
  AttachmentArchiveIntegrityRunResult,
  AttachmentArchiveIntegrityRunSummary,
} from "../attachment-archive/integrity-types";
import { getJsonObject, putJsonObject } from "../attachment-archive/storage";

const awsRegion = process.env.region || process.env.AWS_REGION;
const archiveBucketClient = new S3Client({ region: awsRegion });
const sesClient = new SESClient({ region: awsRegion });

type NotificationMode = "discrepancy" | "failure";

type IntegrityNotificationEvent = {
  mode: NotificationMode;
  runResult?: Partial<AttachmentArchiveIntegrityRunResult> & { summaryKey?: string };
  error?: unknown;
  input?: {
    runResult?: Partial<AttachmentArchiveIntegrityRunResult> & { summaryKey?: string };
    error?: unknown;
  };
};

type RecipientConfig = {
  sourceEmailAddress: string;
  sourceEmailHeader: string;
  toEmailAddresses: string[];
  toEmailHeaders: string[];
};

type ParsedEmailAddress = {
  email: string;
  formatted: string;
};

type ParsedFailurePayload = {
  message: string;
  summaryKey?: string;
  runId?: string;
  stage?: string;
  reportBucketName?: string;
};

function getIntegrityStageName() {
  const stage = process.env.STAGE_NAME?.trim();
  if (!stage) {
    throw new Error("ATTACHMENT_ARCHIVE_INTEGRITY_STAGE_NAME must be defined via STAGE_NAME");
  }

  return stage;
}

function getStorageConfig() {
  const writeBucketName = process.env.ATTACHMENT_ARCHIVE_BUCKET_NAME;
  if (!writeBucketName) {
    throw new Error("ATTACHMENT_ARCHIVE_BUCKET_NAME must be defined");
  }

  const reportPrefix = (
    process.env.ATTACHMENT_ARCHIVE_INTEGRITY_REPORT_PREFIX || "archive-integrity"
  ).replace(/^\/+|\/+$/g, "");
  const stage = getIntegrityStageName();

  return {
    stage,
    reportPrefix,
    writeBucketName,
  };
}

function getEmailAddressLookupSecretName() {
  const emailAddressLookupSecretName = (
    process.env.emailAddressLookupSecretName || "emailAddresses"
  ).trim();
  if (!emailAddressLookupSecretName) {
    throw new Error("emailAddressLookupSecretName must be defined");
  }

  return emailAddressLookupSecretName;
}

function parseAddressEntries(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || "").trim()).filter((entry) => Boolean(entry));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [] as string[];
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((entry) => String(entry || "").trim())
            .filter((entry) => Boolean(entry));
        }
      } catch {
        // Fall through to treat as a single address string.
      }
    }

    return [trimmed];
  }

  return [] as string[];
}

function parseEmailAddress(address: string): ParsedEmailAddress | undefined {
  const formatted = address.trim();
  if (!formatted) {
    return undefined;
  }

  const angleMatch = formatted.match(/<([^<>]+)>/);
  const email = angleMatch ? angleMatch[1].trim() : formatted.trim().replace(/^"|"$/g, "");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return undefined;
  }

  return {
    email,
    formatted,
  };
}

function parseEmailAddressList(addresses: string[]) {
  const parsed: ParsedEmailAddress[] = [];
  const seenEmails = new Set<string>();

  for (const address of addresses) {
    const parsedAddress = parseEmailAddress(address);
    if (!parsedAddress) {
      continue;
    }

    const normalized = parsedAddress.email.toLowerCase();
    if (seenEmails.has(normalized)) {
      continue;
    }

    seenEmails.add(normalized);
    parsed.push(parsedAddress);
  }

  return parsed;
}

async function getRecipientConfig(): Promise<RecipientConfig> {
  const rawSecret = await getSecret(getEmailAddressLookupSecretName());
  const secret = JSON.parse(rawSecret || "{}") as {
    sourceEmail?: unknown;
    archiveAlerts?: unknown;
  };
  const sourceAddresses = parseEmailAddressList(parseAddressEntries(secret.sourceEmail));
  const sourceEmail = sourceAddresses[0];
  if (!sourceEmail) {
    throw new Error("Integrity notification secret is missing sourceEmail");
  }

  const toAddresses = parseEmailAddressList(parseAddressEntries(secret.archiveAlerts));
  if (toAddresses.length === 0) {
    throw new Error("Integrity notification secret is missing archiveAlerts");
  }

  return {
    sourceEmailAddress: sourceEmail.email,
    sourceEmailHeader: sourceEmail.formatted,
    toEmailAddresses: toAddresses.map((address) => address.email),
    toEmailHeaders: toAddresses.map((address) => address.formatted),
  };
}

function chunkBase64(value: string) {
  return value.match(/.{1,76}/g)?.join("\n") || value;
}

function buildRawEmail({
  sourceEmailHeader,
  toEmailHeaders,
  subject,
  bodyText,
  attachment,
}: {
  sourceEmailHeader: string;
  toEmailHeaders: string[];
  subject: string;
  bodyText: string;
  attachment?: {
    filename: string;
    contentType: string;
    body: string;
  };
}) {
  const boundary = `boundary_${randomUUID().replace(/-/g, "")}`;

  const lines = [
    `From: ${sourceEmailHeader}`,
    `To: ${toEmailHeaders.join(", ")}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    bodyText,
  ];

  if (attachment) {
    lines.push(
      `--${boundary}`,
      `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      "Content-Transfer-Encoding: base64",
      "",
      chunkBase64(Buffer.from(attachment.body, "utf8").toString("base64")),
    );
  }

  lines.push(`--${boundary}--`, "");
  return lines.join("\n");
}

async function sendRawEmail({
  sourceEmailAddress,
  sourceEmailHeader,
  toEmailAddresses,
  toEmailHeaders,
  subject,
  bodyText,
  attachment,
}: {
  sourceEmailAddress: string;
  sourceEmailHeader: string;
  toEmailAddresses: string[];
  toEmailHeaders: string[];
  subject: string;
  bodyText: string;
  attachment?: {
    filename: string;
    contentType: string;
    body: string;
  };
}) {
  const rawData = buildRawEmail({
    sourceEmailHeader,
    toEmailHeaders,
    subject,
    bodyText,
    attachment,
  });

  await sesClient.send(
    new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawData, "utf8"),
      },
      Source: sourceEmailAddress,
      Destinations: toEmailAddresses,
    }),
  );
}

async function loadSummary({ bucketName, summaryKey }: { bucketName: string; summaryKey: string }) {
  return await getJsonObject<AttachmentArchiveIntegrityRunSummary>({
    client: archiveBucketClient,
    bucket: bucketName,
    key: summaryKey,
  });
}

async function saveSummary({
  bucketName,
  summaryKey,
  summary,
}: {
  bucketName: string;
  summaryKey: string;
  summary: AttachmentArchiveIntegrityRunSummary;
}) {
  await putJsonObject({
    client: archiveBucketClient,
    bucket: bucketName,
    key: summaryKey,
    body: summary,
  });
}

async function loadCsvAttachment({ bucketName, key }: { bucketName: string; key: string }) {
  const response = await archiveBucketClient.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
  return (await response.Body?.transformToString()) || "";
}

function parseFailurePayload(error: unknown): ParsedFailurePayload {
  const fallback = {
    message: "Attachment archive integrity check failed unexpectedly.",
  };

  if (!error || typeof error !== "object") {
    return fallback;
  }

  const top = error as { Cause?: unknown; Error?: unknown; message?: unknown };
  const causeString =
    typeof top.Cause === "string"
      ? top.Cause
      : typeof top.message === "string"
        ? top.message
        : undefined;

  if (!causeString) {
    return fallback;
  }

  try {
    const parsedCause = JSON.parse(causeString) as { errorMessage?: string };
    if (!parsedCause.errorMessage) {
      return fallback;
    }

    try {
      const parsedPayload = JSON.parse(parsedCause.errorMessage) as {
        message?: string;
        summaryKey?: string;
        runId?: string;
        stage?: string;
        reportBucketName?: string;
      };
      return {
        message: parsedPayload.message || fallback.message,
        summaryKey: parsedPayload.summaryKey,
        runId: parsedPayload.runId,
        stage: parsedPayload.stage,
        reportBucketName: parsedPayload.reportBucketName,
      };
    } catch {
      return {
        message: parsedCause.errorMessage,
      };
    }
  } catch {
    return {
      message: causeString,
    };
  }
}

function createFailureSummary({
  runId,
  stage,
  reportPrefix,
  reportBucketName,
  message,
}: {
  runId: string;
  stage: string;
  reportPrefix: string;
  reportBucketName: string;
  message: string;
}): {
  summary: AttachmentArchiveIntegrityRunSummary;
  summaryKey: string;
} {
  const runTimestamp = new Date().toISOString();
  const date = new Date(runTimestamp);
  const yyyy = date.getUTCFullYear();
  const mm = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getUTCDate()}`.padStart(2, "0");
  const runReportPrefix = `${reportPrefix}/${stage}/runs/${yyyy}/${mm}/${dd}/${runId}`;
  const summaryKey = `${runReportPrefix}/summary.json`;
  const summary: AttachmentArchiveIntegrityRunSummary = {
    runId,
    stage,
    runTimestamp,
    status: "FAILED",
    packagesScanned: 0,
    packagesTotal: 0,
    sectionsScanned: 0,
    discrepancyCount: 0,
    discrepancyTypeCounts: {},
    exceptionCount: 0,
    exceptionTypeCounts: {},
    topDiscrepancyTypes: [],
    reportBucketName,
    reportPrefix: runReportPrefix,
    checkpointKey: "",
    discrepancyJsonKey: "",
    discrepancyCsvKey: "",
    exceptionJsonKey: "",
    exceptionCsvKey: "",
    discrepancyCsvFilename: "discrepancies.csv",
    discrepancyCsvTruncated: false,
    discrepancyCsvRowsIncluded: 0,
    discrepancyCsvRowsTotal: 0,
    notificationStatus: "PENDING",
    errorMessage: message,
  };

  return { summary, summaryKey };
}

function buildDiscrepancyEmailBody(summary: AttachmentArchiveIntegrityRunSummary) {
  const lines = [
    "OneMAC archive integrity discrepancies were detected.",
    "",
    `Stage: ${summary.stage}`,
    `Run timestamp: ${summary.runTimestamp}`,
    `Packages scanned: ${summary.packagesScanned}`,
    `Sections scanned: ${summary.sectionsScanned}`,
    `Total discrepancies: ${summary.discrepancyCount}`,
  ];

  if (summary.exceptionJsonKey || summary.exceptionCount > 0) {
    lines.push(`Approved terminal exceptions: ${summary.exceptionCount}`);
  }

  lines.push("", "Top discrepancy types:");

  if (summary.topDiscrepancyTypes.length === 0) {
    lines.push("- none");
  } else {
    for (const typeCount of summary.topDiscrepancyTypes) {
      lines.push(`- ${typeCount.type}: ${typeCount.count}`);
    }
  }

  lines.push(
    "",
    "CSV discrepancy report is attached.",
    summary.discrepancyCsvTruncated
      ? `Attachment was truncated (${summary.discrepancyCsvRowsIncluded}/${summary.discrepancyCsvRowsTotal} rows included).`
      : `Attachment contains ${summary.discrepancyCsvRowsIncluded} discrepancy rows.`,
  );

  return lines.join("\n");
}

function buildFailureEmailBody({
  summary,
  summaryKey,
  message,
}: {
  summary: AttachmentArchiveIntegrityRunSummary;
  summaryKey?: string;
  message: string;
}) {
  const lines = [
    "OneMAC archive integrity check failed.",
    "",
    `Stage: ${summary.stage}`,
    `Run id: ${summary.runId}`,
    summaryKey ? `Summary key: ${summaryKey}` : "Summary key: unavailable",
    summary.packagesTotal > 0
      ? `Packages scanned: ${summary.packagesScanned}/${summary.packagesTotal}`
      : `Packages scanned: ${summary.packagesScanned}`,
    `Sections scanned: ${summary.sectionsScanned}`,
    `Discrepancies found so far: ${summary.discrepancyCount}`,
  ];

  if (summary.lastProcessedPackageId) {
    lines.push(`Last processed package: ${summary.lastProcessedPackageId}`);
  }

  lines.push("", "Error details:", message);
  return lines.join("\n");
}

async function handleDiscrepancyNotification(event: IntegrityNotificationEvent) {
  if (!event.runResult?.summaryKey || !event.runResult.reportBucketName) {
    throw new Error("Discrepancy notification event is missing summary location");
  }

  const bucketName = event.runResult.reportBucketName;
  const summaryKey = event.runResult.summaryKey;
  const recipients = await getRecipientConfig();
  const summary = await loadSummary({
    bucketName,
    summaryKey,
  });
  if (!summary) {
    throw new Error(`Summary not found at ${summaryKey}`);
  }

  if (summary.discrepancyCount <= 0) {
    summary.notificationStatus = "SKIPPED";
    await saveSummary({
      bucketName,
      summaryKey,
      summary,
    });
    return {
      notificationStatus: summary.notificationStatus,
      summaryKey,
    };
  }

  try {
    const csvBody = await loadCsvAttachment({
      bucketName,
      key: summary.discrepancyCsvKey,
    });
    await sendRawEmail({
      sourceEmailAddress: recipients.sourceEmailAddress,
      sourceEmailHeader: recipients.sourceEmailHeader,
      toEmailAddresses: recipients.toEmailAddresses,
      toEmailHeaders: recipients.toEmailHeaders,
      subject: `[${summary.stage}] OneMAC Archive Integrity Discrepancies (${summary.discrepancyCount})`,
      bodyText: buildDiscrepancyEmailBody(summary),
      attachment: {
        filename: summary.discrepancyCsvFilename,
        contentType: "text/csv",
        body: csvBody,
      },
    });

    summary.notificationStatus = "SENT";
    summary.notificationSentAt = new Date().toISOString();
    delete summary.notificationError;
    await saveSummary({
      bucketName,
      summaryKey,
      summary,
    });

    return {
      notificationStatus: summary.notificationStatus,
      summaryKey,
    };
  } catch (error) {
    summary.notificationStatus = "FAILED";
    summary.notificationError = error instanceof Error ? error.message : String(error);
    await saveSummary({
      bucketName,
      summaryKey,
      summary,
    });
    throw error;
  }
}

async function handleFailureNotification(event: IntegrityNotificationEvent) {
  const storage = getStorageConfig();
  const recipients = await getRecipientConfig();
  const parsedFailure = parseFailurePayload(event.error);

  let summaryKey = parsedFailure.summaryKey || event.runResult?.summaryKey;
  let bucketName =
    parsedFailure.reportBucketName || event.runResult?.reportBucketName || storage.writeBucketName;
  let summary: AttachmentArchiveIntegrityRunSummary | undefined;

  if (summaryKey) {
    summary = await loadSummary({
      bucketName,
      summaryKey,
    });
  }

  if (!summary) {
    const failure = createFailureSummary({
      runId:
        parsedFailure.runId ||
        event.runResult?.runId ||
        `${Date.now()}-${randomUUID().slice(0, 8)}`,
      stage: parsedFailure.stage || event.runResult?.stage || storage.stage,
      reportPrefix: storage.reportPrefix,
      reportBucketName: storage.writeBucketName,
      message: parsedFailure.message,
    });
    summary = failure.summary;
    summaryKey = failure.summaryKey;
    bucketName = storage.writeBucketName;
  }
  if (!summaryKey) {
    throw new Error("Failure notification could not resolve summaryKey");
  }
  const resolvedSummaryKey = summaryKey;
  if (summary.status === "RUNNING") {
    summary.status = "FAILED";
  }

  try {
    await sendRawEmail({
      sourceEmailAddress: recipients.sourceEmailAddress,
      sourceEmailHeader: recipients.sourceEmailHeader,
      toEmailAddresses: recipients.toEmailAddresses,
      toEmailHeaders: recipients.toEmailHeaders,
      subject: `[${summary.stage}] OneMAC Archive Integrity Check Failed`,
      bodyText: buildFailureEmailBody({
        summary,
        summaryKey: resolvedSummaryKey,
        message: parsedFailure.message,
      }),
    });

    summary.notificationStatus = "SENT";
    summary.notificationSentAt = new Date().toISOString();
    summary.errorMessage = parsedFailure.message;
    delete summary.notificationError;
    await saveSummary({
      bucketName,
      summaryKey: resolvedSummaryKey,
      summary,
    });
  } catch (error) {
    summary.notificationStatus = "FAILED";
    summary.notificationError = error instanceof Error ? error.message : String(error);
    summary.errorMessage = parsedFailure.message;
    await saveSummary({
      bucketName,
      summaryKey: resolvedSummaryKey,
      summary,
    });
    throw error;
  }

  return {
    notificationStatus: summary.notificationStatus,
    summaryKey: resolvedSummaryKey,
  };
}

export const handler = async (event: IntegrityNotificationEvent) => {
  const normalizedEvent: IntegrityNotificationEvent = {
    ...event,
    runResult: event.runResult || event.input?.runResult,
    error: event.error || event.input?.error,
  };

  if (normalizedEvent.mode === "failure") {
    return await handleFailureNotification(normalizedEvent);
  }

  return await handleDiscrepancyNotification(normalizedEvent);
};
