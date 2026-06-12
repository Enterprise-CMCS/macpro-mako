import {
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { SendRawEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { randomUUID } from "crypto";
import { Consumer, Kafka } from "kafkajs";
import { getStatus, SEATOOL_SPW_STATUS, SEATOOL_STATUS } from "shared-types";
import { getSecret } from "shared-utils";

import { getClient } from "../libs/opensearch-lib";
import { getDomainAndNamespace } from "../libs/utils";

const CAS_VALUE = "Date Sent to CAS";
const DEFAULT_BATCH_SIZE = 500;
const DEFAULT_INPUT_SOURCE = "KAFKA";
const DEFAULT_KAFKA_CONSUME_TIMEOUT_MS = 10 * 60 * 1000;
const DEFAULT_REPORT_PREFIX = "seatool-status-mismatch";
const DEFAULT_SEATOOL_STATUS_TOPIC = "aws.seatool.ksql.onemac.three.agg.State_Plan";
const RAW_SEATOOL_STATUS_DISPLAY_FALLBACKS: Record<string, string> = {
  "Pending-Finance": SEATOOL_STATUS.UNKNOWN,
};
const MISMATCH_CSV_COLUMNS = [
  "ID_Number",
  "status",
  "cmsStatus",
  "stateStatus",
  "seatoolStatus",
  "expectedCmsStatus",
  "expectedStateStatus",
  "classification",
  "actionType",
  "authority",
  "id",
] as const;

const awsRegion = process.env.region || process.env.AWS_REGION;
const s3Client = new S3Client({ region: awsRegion });
const sesClient = new SESClient({ region: awsRegion });

type CsvRecord = Record<string, string>;

export type SeatoolStatusRow = {
  id: string;
  status: string;
  row: CsvRecord;
};

export type OneMacStatusRecord = {
  id: string;
  actionType?: unknown;
  authority?: unknown;
  cmsStatus?: unknown;
  seatoolStatus?: unknown;
  stateStatus?: unknown;
};

export type StatusMismatchRow = {
  ID_Number: string;
  status: string;
  cmsStatus: string;
  stateStatus: string;
  seatoolStatus: string;
  expectedCmsStatus: string;
  expectedStateStatus: string;
  classification: string;
  actionType: string;
  authority: string;
  id: string;
};

type CompareResult = {
  mismatchRows: StatusMismatchRow[];
  comparableRows: number;
  missingOneMacCount: number;
  skippedRows: number;
};

type ReportEvent = {
  inputSource?: "CSV" | "KAFKA";
  seatoolCsvBucket?: string;
  seatoolCsvKey?: string;
  runTimestamp?: string;
};

type ResolvedInputLocation = {
  bucket: string;
  key: string;
};

type ReportStorageConfig = {
  inputBucketName: string;
  inputKeyPrefix: string;
  reportBucketName: string;
  reportPrefix: string;
  stage: string;
  batchSize: number;
};

type KafkaSourceConfig = {
  brokerString: string;
  consumeTimeoutMs: number;
  consumerGroupIdPrefix: string;
  topic: string;
};

type ReportNotificationConfig = {
  emailAddressLookupSecretName: string;
  recipientEmails: string[];
};

type ParsedEmailAddress = {
  email: string;
  formatted: string;
};

type SeatoolInputData = {
  source: "CSV" | "KAFKA";
  rows: SeatoolStatusRow[];
  inputBucketName?: string;
  inputKey?: string;
  kafkaTopic?: string;
  kafkaRecordsRead?: number;
  kafkaOffsets?: SeatoolStatusMismatchReportResult["kafkaOffsets"];
};

export type SeatoolStatusMismatchReportResult = {
  status: "COMPLETE";
  runId: string;
  stage: string;
  runTimestamp: string;
  inputSource: "CSV" | "KAFKA";
  inputBucketName?: string;
  inputKey?: string;
  kafkaTopic?: string;
  kafkaRecordsRead?: number;
  kafkaOffsets?: {
    partition: number;
    high: string;
    low: string;
  }[];
  reportBucketName: string;
  reportPrefix: string;
  summaryKey: string;
  mismatchCsvKey: string;
  mismatchCsvFilename: string;
  seatoolRowsLoaded: number;
  oneMacRecordsRequested: number;
  oneMacRecordsFound: number;
  missingOneMacCount: number;
  comparableRows: number;
  skippedRows: number;
  mismatchCount: number;
  mismatchCountsByClassification: Record<string, number>;
  notificationStatus: "DISABLED" | "FAILED" | "SENT" | "SKIPPED";
  notificationRecipients: string[];
  notificationSentAt?: string;
  notificationError?: string;
};

function getStageName() {
  const stage = process.env.STAGE_NAME?.trim();
  if (!stage) {
    throw new Error("STAGE_NAME must be defined");
  }
  return stage;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getStorageConfig(): ReportStorageConfig {
  const stage = getStageName();
  const inputBucketName = process.env.SEATOOL_STATUS_MISMATCH_INPUT_BUCKET_NAME?.trim();
  if (!inputBucketName) {
    throw new Error("SEATOOL_STATUS_MISMATCH_INPUT_BUCKET_NAME must be defined");
  }

  const reportBucketName =
    process.env.SEATOOL_STATUS_MISMATCH_REPORT_BUCKET_NAME?.trim() || inputBucketName;
  const reportPrefix = (
    process.env.SEATOOL_STATUS_MISMATCH_REPORT_PREFIX || DEFAULT_REPORT_PREFIX
  ).replace(/^\/+|\/+$/g, "");
  const inputKeyPrefix = (
    process.env.SEATOOL_STATUS_MISMATCH_INPUT_KEY_PREFIX || `${reportPrefix}/${stage}/input/`
  ).replace(/^\/+/, "");

  return {
    inputBucketName,
    inputKeyPrefix,
    reportBucketName,
    reportPrefix,
    stage,
    batchSize: parsePositiveInteger(
      process.env.SEATOOL_STATUS_MISMATCH_OPENSEARCH_BATCH_SIZE,
      DEFAULT_BATCH_SIZE,
    ),
  };
}

function getKafkaSourceConfig(stage: string): KafkaSourceConfig {
  const brokerString = process.env.brokerString?.trim();
  if (!brokerString) {
    throw new Error("brokerString must be defined for SEATool Kafka status mismatch reports");
  }

  return {
    brokerString,
    consumeTimeoutMs: parsePositiveInteger(
      process.env.SEATOOL_STATUS_MISMATCH_KAFKA_CONSUME_TIMEOUT_MS,
      DEFAULT_KAFKA_CONSUME_TIMEOUT_MS,
    ),
    consumerGroupIdPrefix:
      process.env.SEATOOL_STATUS_MISMATCH_KAFKA_CONSUMER_GROUP_PREFIX?.trim() ||
      `--mako--${stage}--seatool-status-mismatch-report`,
    topic:
      process.env.SEATOOL_STATUS_MISMATCH_SEATOOL_TOPIC?.trim() || DEFAULT_SEATOOL_STATUS_TOPIC,
  };
}

function getNotificationConfig(): ReportNotificationConfig {
  const emailAddressLookupSecretName = (
    process.env.emailAddressLookupSecretName || "emailAddresses"
  ).trim();
  const recipientEmails = parseEmailAddressList(
    parseAddressEntries(process.env.SEATOOL_STATUS_MISMATCH_RECIPIENT_EMAILS),
  ).map((address) => address.email);

  return {
    emailAddressLookupSecretName,
    recipientEmails,
  };
}

function getInputSource(event: ReportEvent | undefined): "CSV" | "KAFKA" {
  if (event?.seatoolCsvKey || event?.seatoolCsvBucket) {
    return "CSV";
  }

  const rawSource = (event?.inputSource || process.env.SEATOOL_STATUS_MISMATCH_INPUT_SOURCE || "")
    .trim()
    .toUpperCase();

  if (rawSource === "CSV" || rawSource === "KAFKA") {
    return rawSource;
  }

  return DEFAULT_INPUT_SOURCE;
}

export function normalizeStatus(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  let status = String(value).trim();
  status = status.replace(/[–—]/g, "-");
  status = status.replace(/\s+/g, " ");
  status = status.replace(/\s*-\s*/g, "-");

  if (status.toLowerCase() === "package withdrawn") {
    return "Withdrawn";
  }

  return status;
}

export function normalizeStatusComparisonKey(value: unknown): string {
  return normalizeStatus(value).toLocaleLowerCase("en-US");
}

function canonicalSeatoolStatus(value: unknown) {
  const statusKey = normalizeStatusComparisonKey(value);
  const knownStatuses = [
    ...Object.values(SEATOOL_STATUS),
    ...Object.keys(RAW_SEATOOL_STATUS_DISPLAY_FALLBACKS),
  ];
  return (
    knownStatuses.find((status) => normalizeStatusComparisonKey(status) === statusKey) ||
    normalizeStatus(value)
  );
}

function getDisplayStatusForSeatoolStatus(value: unknown) {
  const canonicalStatus = canonicalSeatoolStatus(value);
  if (!canonicalStatus) {
    return {
      cmsStatus: "",
      stateStatus: "",
    };
  }

  const displayStatus = RAW_SEATOOL_STATUS_DISPLAY_FALLBACKS[canonicalStatus] || canonicalStatus;
  const { cmsStatus, stateStatus } = getStatus(displayStatus);
  return {
    cmsStatus: cmsStatus || SEATOOL_STATUS.UNKNOWN,
    stateStatus: stateStatus || SEATOOL_STATUS.UNKNOWN,
  };
}

function toReportString(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function getExpectedSeatoolStatus(seatoolStatus: unknown, oneMacRecord: OneMacStatusRecord) {
  const canonicalStatus = canonicalSeatoolStatus(seatoolStatus);
  const oneMacSeatoolStatus = canonicalSeatoolStatus(oneMacRecord.seatoolStatus);

  if (!canonicalStatus) {
    return "";
  }

  if (oneMacSeatoolStatus === SEATOOL_STATUS.WITHDRAW_REQUESTED) {
    return canonicalStatus === SEATOOL_STATUS.WITHDRAWN
      ? canonicalStatus
      : SEATOOL_STATUS.WITHDRAW_REQUESTED;
  }

  if (oneMacSeatoolStatus === SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED) {
    if (
      canonicalStatus === SEATOOL_STATUS.PENDING_RAI ||
      [SEATOOL_STATUS.WITHDRAWN, SEATOOL_STATUS.TERMINATED, SEATOOL_STATUS.DISAPPROVED].includes(
        canonicalStatus,
      )
    ) {
      return canonicalStatus;
    }

    return SEATOOL_STATUS.RAI_RESPONSE_WITHDRAW_REQUESTED;
  }

  return canonicalStatus;
}

function getStatusComparison({
  seatoolStatus,
  oneMacRecord,
}: {
  seatoolStatus: unknown;
  oneMacRecord: OneMacStatusRecord;
}) {
  const canonicalStatus = canonicalSeatoolStatus(seatoolStatus);
  const oneMacSeatoolStatus = canonicalSeatoolStatus(oneMacRecord.seatoolStatus);

  if (
    canonicalStatus === SEATOOL_STATUS.PENDING &&
    oneMacSeatoolStatus === SEATOOL_STATUS.PENDING &&
    normalizeStatusComparisonKey(oneMacRecord.cmsStatus) === "requested" &&
    normalizeStatusComparisonKey(oneMacRecord.stateStatus) === "submitted" &&
    normalizeStatusComparisonKey(oneMacRecord.actionType) === "extend"
  ) {
    return {
      expectedCmsStatus: "Requested",
      expectedStateStatus: "Submitted",
      classification: "TEMPORARY_EXTENSION_REQUESTED_DISPLAY",
    };
  }

  const expectedSeatoolStatus = getExpectedSeatoolStatus(seatoolStatus, oneMacRecord);
  const expectedDisplay = getDisplayStatusForSeatoolStatus(expectedSeatoolStatus);
  const classification =
    canonicalStatus === SEATOOL_STATUS.PENDING_RAI &&
    oneMacSeatoolStatus === SEATOOL_STATUS.SUBMITTED
      ? "NEEDS_RAI_CHANGELOG_REVIEW"
      : "STALE_ONEMAC_STATUS";

  return {
    expectedCmsStatus: expectedDisplay.cmsStatus,
    expectedStateStatus: expectedDisplay.stateStatus,
    classification,
  };
}

export function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];

    if (inQuotes) {
      if (char === '"') {
        if (csv[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (char === "\r" && csv[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function isSeparatorRow(record: CsvRecord) {
  const values = Object.values(record)
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length > 0 && values.every((value) => /^-+$/.test(value));
}

function toCsvRecords(rows: string[][]): CsvRecord[] {
  const headerRow = rows[0];
  if (!headerRow) {
    return [];
  }

  const headers = headerRow.map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim(),
  );

  return rows.slice(1).reduce<CsvRecord[]>((records, values) => {
    const record = headers.reduce<CsvRecord>((acc, header, index) => {
      if (header) {
        acc[header] = values[index] ?? "";
      }
      return acc;
    }, {});

    if (!isSeparatorRow(record)) {
      records.push(record);
    }

    return records;
  }, []);
}

function detectColumn(records: CsvRecord[], preferred: string[], contains: string) {
  const columns = Object.keys(records[0] || {});
  for (const candidate of preferred) {
    if (columns.includes(candidate)) {
      return candidate;
    }
  }

  const containsMatch = columns.find((column) => column.toLowerCase().includes(contains));
  if (containsMatch) {
    return containsMatch;
  }

  throw new Error(`Could not detect required SEATool column. Columns: ${columns.join(", ")}`);
}

export function parseSeatoolStatusRows(csv: string): SeatoolStatusRow[] {
  const records = toCsvRecords(parseCsvRows(csv));
  if (records.length === 0) {
    return [];
  }

  const idColumn = detectColumn(
    records,
    ["ID_Number", "Id", "Spa id", "SPA ID", "Map ID", "spa_id", "id"],
    "id",
  );
  const statusColumn = detectColumn(
    records,
    ["status", "Status", "SPA Status", "Seatool Status"],
    "status",
  );

  return records
    .map((row) => ({
      id: (row[idColumn] || "").trim(),
      status: (row[statusColumn] || "").trim(),
      row,
    }))
    .filter((row) => row.id || row.status);
}

function toLookupId(id: string) {
  return id.trim().toUpperCase();
}

function removeDoubleQuotesSurroundingString(value: string) {
  return value.replace(/^"|"$/g, "");
}

function kafkaValueToString(value: Buffer | string | null | undefined) {
  if (Buffer.isBuffer(value)) {
    return value.toString("utf8");
  }

  return value === null || value === undefined ? "" : String(value);
}

export function parseSeatoolKafkaStatusRow({
  key,
  value,
}: {
  key: Buffer | string | null | undefined;
  value: Buffer | string | null | undefined;
}): SeatoolStatusRow | undefined {
  const id = removeDoubleQuotesSurroundingString(kafkaValueToString(key)).trim();
  if (!id || !value) {
    return undefined;
  }

  const rawRecord = JSON.parse(kafkaValueToString(value)) as {
    STATE_PLAN?: {
      SPW_STATUS_ID?: number | string | null;
    };
  };
  const rawStatusId = rawRecord.STATE_PLAN?.SPW_STATUS_ID;
  const status =
    rawStatusId === null || rawStatusId === undefined
      ? "Unknown"
      : SEATOOL_SPW_STATUS[String(rawStatusId)] || "Unknown";

  return {
    id,
    status,
    row: {
      ID_Number: id,
      SPW_STATUS_ID: rawStatusId === null || rawStatusId === undefined ? "" : String(rawStatusId),
      status,
    },
  };
}

function stringifyCsvValue(value: unknown) {
  const raw = value === null || value === undefined ? "" : String(value);
  if (raw.includes('"') || raw.includes(",") || raw.includes("\n")) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
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
        // Fall through to treat as a comma-delimited address string.
      }
    }

    return trimmed
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => Boolean(entry));
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
  attachment: {
    filename: string;
    contentType: string;
    body: string;
  };
}) {
  const boundary = `boundary_${randomUUID().replace(/-/g, "")}`;

  return [
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
    `--${boundary}`,
    `Content-Type: ${attachment.contentType}; name="${attachment.filename}"`,
    `Content-Disposition: attachment; filename="${attachment.filename}"`,
    "Content-Transfer-Encoding: base64",
    "",
    chunkBase64(Buffer.from(attachment.body, "utf8").toString("base64")),
    `--${boundary}--`,
    "",
  ].join("\n");
}

export function buildCsv<TRecord extends Record<string, unknown>>(
  rows: TRecord[],
  columns: readonly (keyof TRecord)[],
) {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => stringifyCsvValue(row[column])).join(",")),
  ].join("\n");
}

function countMismatchRowsByClassification(rows: StatusMismatchRow[]) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.classification] = (acc[row.classification] || 0) + 1;
    return acc;
  }, {});
}

export function compareSeatoolToOneMac(
  seatoolRows: SeatoolStatusRow[],
  oneMacRecordsById: Map<string, OneMacStatusRecord>,
): CompareResult {
  const mismatchRows: StatusMismatchRow[] = [];
  const seenMismatchRows = new Set<string>();
  const casStatusKey = normalizeStatusComparisonKey(CAS_VALUE);
  let comparableRows = 0;
  let missingOneMacCount = 0;
  let skippedRows = 0;

  for (const seatoolRow of seatoolRows) {
    const lookupId = toLookupId(seatoolRow.id);
    const oneMacRecord = oneMacRecordsById.get(lookupId);
    if (!oneMacRecord) {
      missingOneMacCount += 1;
      continue;
    }

    const rawSeatoolStatusKey = normalizeStatusComparisonKey(seatoolRow.status);
    const cmsStatusKey = normalizeStatusComparisonKey(oneMacRecord.cmsStatus);
    if (
      !rawSeatoolStatusKey ||
      !cmsStatusKey ||
      rawSeatoolStatusKey === casStatusKey ||
      cmsStatusKey === casStatusKey
    ) {
      skippedRows += 1;
      continue;
    }

    const statusComparison = getStatusComparison({
      seatoolStatus: seatoolRow.status,
      oneMacRecord,
    });
    const seatoolStatusKey = normalizeStatusComparisonKey(statusComparison.expectedCmsStatus);
    if (!seatoolStatusKey) {
      skippedRows += 1;
      continue;
    }

    comparableRows += 1;
    if (seatoolStatusKey === cmsStatusKey) {
      continue;
    }

    const mismatchRow: StatusMismatchRow = {
      ID_Number: seatoolRow.id,
      status: seatoolRow.status,
      cmsStatus: toReportString(oneMacRecord.cmsStatus),
      stateStatus: toReportString(oneMacRecord.stateStatus),
      seatoolStatus: toReportString(oneMacRecord.seatoolStatus),
      expectedCmsStatus: statusComparison.expectedCmsStatus,
      expectedStateStatus: statusComparison.expectedStateStatus,
      classification: statusComparison.classification,
      actionType: toReportString(oneMacRecord.actionType),
      authority: toReportString(oneMacRecord.authority),
      id: oneMacRecord.id || lookupId,
    };
    const dedupeKey = JSON.stringify(mismatchRow);
    if (!seenMismatchRows.has(dedupeKey)) {
      seenMismatchRows.add(dedupeKey);
      mismatchRows.push(mismatchRow);
    }
  }

  return {
    mismatchRows,
    comparableRows,
    missingOneMacCount,
    skippedRows,
  };
}

function buildReportRunPrefix({
  reportPrefix,
  runTimestamp,
  runId,
  stage,
}: {
  reportPrefix: string;
  runTimestamp: string;
  runId: string;
  stage: string;
}) {
  const date = new Date(runTimestamp);
  const yyyy = date.getUTCFullYear();
  const mm = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getUTCDate()}`.padStart(2, "0");

  return `${reportPrefix}/${stage}/runs/${yyyy}/${mm}/${dd}/${runId}`;
}

async function listLatestCsvKey({
  bucket,
  prefix,
}: {
  bucket: string;
  prefix: string;
}): Promise<string> {
  const candidates: { key: string; lastModified?: Date }[] = [];
  let continuationToken: string | undefined;

  do {
    const response = (await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    )) as ListObjectsV2CommandOutput;

    for (const object of response.Contents || []) {
      if (object.Key && object.Key.toLowerCase().endsWith(".csv")) {
        candidates.push({
          key: object.Key,
          lastModified: object.LastModified,
        });
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  candidates.sort((left, right) => {
    const leftTime = left.lastModified?.getTime() || 0;
    const rightTime = right.lastModified?.getTime() || 0;
    return rightTime - leftTime || right.key.localeCompare(left.key);
  });

  const latest = candidates[0];
  if (!latest) {
    throw new Error(`No SEATool CSV files found at s3://${bucket}/${prefix}`);
  }

  return latest.key;
}

async function resolveInputLocation(
  event: ReportEvent | undefined,
  storage: ReportStorageConfig,
): Promise<ResolvedInputLocation> {
  const bucket = event?.seatoolCsvBucket?.trim() || storage.inputBucketName;
  const explicitKey = event?.seatoolCsvKey?.trim();
  const key = explicitKey || (await listLatestCsvKey({ bucket, prefix: storage.inputKeyPrefix }));

  return {
    bucket,
    key,
  };
}

async function getObjectText({ bucket, key }: { bucket: string; key: string }) {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
  const body = response.Body as { transformToString?: () => Promise<string> } | undefined;
  if (!body?.transformToString) {
    throw new Error(`S3 object body missing for s3://${bucket}/${key}`);
  }

  return await body.transformToString();
}

async function putStringObject({
  bucket,
  key,
  body,
  contentType,
}: {
  bucket: string;
  key: string;
  body: string;
  contentType: string;
}) {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

async function disconnectKafkaConsumer(consumer: Consumer) {
  try {
    await consumer.disconnect();
  } catch (error) {
    console.warn(
      "Failed to disconnect SEATool status mismatch Kafka consumer",
      error instanceof Error ? error.message : String(error),
    );
  }
}

async function loadSeatoolRowsFromKafka({
  stage,
  kafkaConfig,
}: {
  stage: string;
  kafkaConfig: KafkaSourceConfig;
}): Promise<SeatoolInputData> {
  const kafka = new Kafka({
    clientId: `seatool-status-mismatch-report-${stage}`,
    brokers: kafkaConfig.brokerString.split(","),
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 8000,
    requestTimeout: 12000,
    retry: {
      retries: 3,
    },
  });
  const admin = kafka.admin();
  const consumer = kafka.consumer({
    groupId: `${kafkaConfig.consumerGroupIdPrefix}-${Date.now()}-${randomUUID().slice(0, 8)}`,
  });
  const seatoolRowsById = new Map<string, SeatoolStatusRow>();
  let recordsRead = 0;

  await admin.connect();
  const offsets = await admin.fetchTopicOffsets(kafkaConfig.topic);
  await admin.disconnect();

  const kafkaOffsets = offsets.map((offset) => ({
    partition: offset.partition,
    high: offset.high ?? offset.offset,
    low: offset.low ?? "0",
  }));
  const highOffsets = new Map(
    kafkaOffsets.map((offset) => [offset.partition, Number.parseInt(offset.high, 10)]),
  );
  const partitionsToRead = kafkaOffsets.filter(
    (offset) => Number.parseInt(offset.high, 10) > Number.parseInt(offset.low, 10),
  );

  if (partitionsToRead.length === 0) {
    return {
      source: "KAFKA",
      rows: [],
      kafkaTopic: kafkaConfig.topic,
      kafkaRecordsRead: 0,
      kafkaOffsets,
    };
  }

  let resolveFinished: () => void = () => {};
  let rejectFinished: (error: unknown) => void = () => {};
  const finished = new Promise<void>((resolve, reject) => {
    resolveFinished = resolve;
    rejectFinished = reject;
  });
  const finishedPartitions = new Set<number>();
  const timeout = setTimeout(() => {
    rejectFinished(
      new Error(
        `Timed out reading SEATool Kafka topic ${kafkaConfig.topic} after ${kafkaConfig.consumeTimeoutMs}ms`,
      ),
    );
  }, kafkaConfig.consumeTimeoutMs);

  await consumer.connect();
  await consumer.subscribe({
    topic: kafkaConfig.topic,
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: false,
    eachBatchAutoResolve: false,
    eachBatch: async ({ batch, heartbeat, isRunning, isStale, resolveOffset }) => {
      for (const message of batch.messages) {
        if (!isRunning() || isStale()) {
          return;
        }

        const row = parseSeatoolKafkaStatusRow({
          key: message.key,
          value: message.value,
        });
        recordsRead += 1;

        if (row) {
          seatoolRowsById.set(toLookupId(row.id), row);
        } else if (message.key) {
          seatoolRowsById.delete(
            toLookupId(removeDoubleQuotesSurroundingString(kafkaValueToString(message.key))),
          );
        }

        resolveOffset(message.offset);
        await heartbeat();

        const nextOffset = Number.parseInt(message.offset, 10) + 1;
        const highOffset = highOffsets.get(batch.partition);
        if (highOffset !== undefined && nextOffset >= highOffset) {
          finishedPartitions.add(batch.partition);
          if (finishedPartitions.size >= partitionsToRead.length) {
            resolveFinished();
          }
        }
      }
    },
  });

  try {
    await finished;
  } finally {
    clearTimeout(timeout);
    await disconnectKafkaConsumer(consumer);
  }

  return {
    source: "KAFKA",
    rows: Array.from(seatoolRowsById.values()),
    kafkaTopic: kafkaConfig.topic,
    kafkaRecordsRead: recordsRead,
    kafkaOffsets,
  };
}

async function loadSeatoolInputData({
  event,
  storage,
}: {
  event: ReportEvent | undefined;
  storage: ReportStorageConfig;
}): Promise<SeatoolInputData> {
  const inputSource = getInputSource(event);
  if (inputSource === "CSV") {
    const inputLocation = await resolveInputLocation(event, storage);
    const seatoolCsv = await getObjectText(inputLocation);

    return {
      source: "CSV",
      rows: parseSeatoolStatusRows(seatoolCsv),
      inputBucketName: inputLocation.bucket,
      inputKey: inputLocation.key,
    };
  }

  return loadSeatoolRowsFromKafka({
    stage: storage.stage,
    kafkaConfig: getKafkaSourceConfig(storage.stage),
  });
}

async function getSourceEmailAddress(emailAddressLookupSecretName: string) {
  const rawSecret = await getSecret(emailAddressLookupSecretName);
  const secret = JSON.parse(rawSecret || "{}") as {
    sourceEmail?: unknown;
  };
  const sourceEmail = parseEmailAddressList(parseAddressEntries(secret.sourceEmail))[0];
  if (!sourceEmail) {
    throw new Error("SEATool status mismatch notification secret is missing sourceEmail");
  }

  return sourceEmail;
}

async function sendMismatchNotification({
  result,
  notificationConfig,
  mismatchCsv,
}: {
  result: SeatoolStatusMismatchReportResult;
  notificationConfig: ReportNotificationConfig;
  mismatchCsv: string;
}) {
  if (result.mismatchCount === 0) {
    return {
      notificationStatus: "SKIPPED" as const,
      notificationRecipients: [] as string[],
    };
  }

  if (notificationConfig.recipientEmails.length === 0) {
    return {
      notificationStatus: "DISABLED" as const,
      notificationRecipients: [] as string[],
    };
  }

  const sourceEmail = await getSourceEmailAddress(notificationConfig.emailAddressLookupSecretName);
  const subject = `[${result.stage}] OneMAC/SEATool status mismatches: ${result.mismatchCount}`;
  const sourceLine =
    result.inputSource === "KAFKA"
      ? `SEATool source: Kafka topic ${result.kafkaTopic}`
      : `Input CSV: s3://${result.inputBucketName}/${result.inputKey}`;
  const bodyText = [
    `SEATool/OneMAC status mismatch report found ${result.mismatchCount} status mismatch(es).`,
    "",
    `Stage: ${result.stage}`,
    sourceLine,
    `Report CSV: s3://${result.reportBucketName}/${result.mismatchCsvKey}`,
    `Summary: s3://${result.reportBucketName}/${result.summaryKey}`,
    "",
    "Only records present in both OneMAC and SEATool are included in the attached CSV.",
  ].join("\n");
  const rawData = buildRawEmail({
    sourceEmailHeader: sourceEmail.formatted,
    toEmailHeaders: notificationConfig.recipientEmails,
    subject,
    bodyText,
    attachment: {
      filename: result.mismatchCsvFilename,
      contentType: "text/csv",
      body: mismatchCsv,
    },
  });

  await sesClient.send(
    new SendRawEmailCommand({
      RawMessage: {
        Data: Buffer.from(rawData, "utf8"),
      },
      Source: sourceEmail.email,
      Destinations: notificationConfig.recipientEmails,
    }),
  );

  return {
    notificationStatus: "SENT" as const,
    notificationRecipients: notificationConfig.recipientEmails,
    notificationSentAt: new Date().toISOString(),
  };
}

async function fetchOneMacStatusRecords(
  ids: string[],
  batchSize: number,
): Promise<Map<string, OneMacStatusRecord>> {
  const { domain, index } = getDomainAndNamespace("main");
  const client = await getClient(domain);
  const recordsById = new Map<string, OneMacStatusRecord>();
  const uniqueIds = Array.from(new Set(ids.map(toLookupId).filter(Boolean)));

  for (let indexStart = 0; indexStart < uniqueIds.length; indexStart += batchSize) {
    const batchIds = uniqueIds.slice(indexStart, indexStart + batchSize);
    const response = await client.mget({
      index,
      body: {
        ids: batchIds,
      },
    });
    const docs = (response.body?.docs || []) as {
      _id?: string;
      found?: boolean;
      _source?: {
        actionType?: unknown;
        authority?: unknown;
        id?: unknown;
        cmsStatus?: unknown;
        seatoolStatus?: unknown;
        stateStatus?: unknown;
      };
    }[];

    for (const doc of docs) {
      if (!doc.found || !doc._source) {
        continue;
      }
      const id = String(doc._source.id || doc._id || "").trim();
      if (!id) {
        continue;
      }

      recordsById.set(toLookupId(id), {
        id,
        actionType: doc._source.actionType,
        authority: doc._source.authority,
        cmsStatus: doc._source.cmsStatus,
        seatoolStatus: doc._source.seatoolStatus,
        stateStatus: doc._source.stateStatus,
      });
    }
  }

  return recordsById;
}

export const handler = async (
  event: ReportEvent = {},
): Promise<SeatoolStatusMismatchReportResult> => {
  const storage = getStorageConfig();
  const notificationConfig = getNotificationConfig();
  const runTimestamp = event.runTimestamp || new Date().toISOString();
  const runId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const runReportPrefix = buildReportRunPrefix({
    reportPrefix: storage.reportPrefix,
    runTimestamp,
    runId,
    stage: storage.stage,
  });
  const summaryKey = `${runReportPrefix}/summary.json`;
  const mismatchCsvFilename = "true_status_mismatches.csv";
  const mismatchCsvKey = `${runReportPrefix}/${mismatchCsvFilename}`;

  const seatoolInput = await loadSeatoolInputData({
    event,
    storage,
  });
  const seatoolRows = seatoolInput.rows;
  const oneMacRecordsById = await fetchOneMacStatusRecords(
    seatoolRows.map((row) => row.id),
    storage.batchSize,
  );
  const compareResult = compareSeatoolToOneMac(seatoolRows, oneMacRecordsById);
  const mismatchCsv = buildCsv(compareResult.mismatchRows, MISMATCH_CSV_COLUMNS);

  await putStringObject({
    bucket: storage.reportBucketName,
    key: mismatchCsvKey,
    body: mismatchCsv,
    contentType: "text/csv",
  });

  const result: SeatoolStatusMismatchReportResult = {
    status: "COMPLETE",
    runId,
    stage: storage.stage,
    runTimestamp,
    inputSource: seatoolInput.source,
    inputBucketName: seatoolInput.inputBucketName,
    inputKey: seatoolInput.inputKey,
    kafkaTopic: seatoolInput.kafkaTopic,
    kafkaRecordsRead: seatoolInput.kafkaRecordsRead,
    kafkaOffsets: seatoolInput.kafkaOffsets,
    reportBucketName: storage.reportBucketName,
    reportPrefix: runReportPrefix,
    summaryKey,
    mismatchCsvKey,
    mismatchCsvFilename,
    seatoolRowsLoaded: seatoolRows.length,
    oneMacRecordsRequested: new Set(seatoolRows.map((row) => toLookupId(row.id)).filter(Boolean))
      .size,
    oneMacRecordsFound: oneMacRecordsById.size,
    missingOneMacCount: compareResult.missingOneMacCount,
    comparableRows: compareResult.comparableRows,
    skippedRows: compareResult.skippedRows,
    mismatchCount: compareResult.mismatchRows.length,
    mismatchCountsByClassification: countMismatchRowsByClassification(compareResult.mismatchRows),
    notificationStatus: compareResult.mismatchRows.length > 0 ? "DISABLED" : "SKIPPED",
    notificationRecipients: [],
  };

  try {
    Object.assign(
      result,
      await sendMismatchNotification({
        result,
        notificationConfig,
        mismatchCsv,
      }),
    );
  } catch (error) {
    result.notificationStatus = "FAILED";
    result.notificationRecipients = notificationConfig.recipientEmails;
    result.notificationError = error instanceof Error ? error.message : String(error);
  }

  await putStringObject({
    bucket: storage.reportBucketName,
    key: summaryKey,
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });

  console.log("SEATool status mismatch report complete", JSON.stringify(result));

  if (result.notificationStatus === "FAILED") {
    throw new Error(`SEATool status mismatch notification failed: ${result.notificationError}`);
  }

  return result;
};
