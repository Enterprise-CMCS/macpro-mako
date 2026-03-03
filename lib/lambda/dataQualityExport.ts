import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Handler } from "aws-lambda";
import { once } from "events";
import { createReadStream, createWriteStream } from "fs";
import { decodeUtf8, getClient } from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { join } from "path";
import { BaseIndex } from "shared-types/opensearch";

import { evaluateRecord, getRuleSummary, RuleSummary, RuleViolation } from "./data-quality/rules";

const DEFAULT_PAGE_SIZE = 1000;
const DEFAULT_PRESIGN_DAYS = 7;
const MAX_PRESIGN_SECONDS = 60 * 60 * 24 * 7;

type ExportEvent = {
  runId?: string;
  indices?: BaseIndex[];
  pageSize?: number;
  emailRecipients?: string[] | string;
  emailFrom?: string;
  presignDays?: number;
};

type ExportResult = {
  index: BaseIndex;
  objectKey: string;
  rowCount: number;
  columns: string[];
  violationsKey: string;
  violationCount: number;
  ruleSummary: RuleSummary;
};

export const handler: Handler<ExportEvent> = async (event = {}) => {
  const bucketName = process.env.DATA_QUALITY_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("DATA_QUALITY_BUCKET_NAME must be set");
  }

  const runId = event.runId ?? new Date().toISOString().replace(/[:.]/g, "-");
  const indices: BaseIndex[] = event.indices?.length ? event.indices : ["main", "changelog"];
  const pageSize = event.pageSize ?? DEFAULT_PAGE_SIZE;

  const s3Client = new S3Client({});
  const sesClient = new SESClient({});

  console.log("Data quality export started", {
    runId,
    indices,
    pageSize,
  });

  const results: ExportResult[] = [];
  for (const baseIndex of indices) {
    const result = await exportIndex(baseIndex, {
      runId,
      bucketName,
      pageSize,
      s3Client,
    });
    results.push(result);
  }

  const manifestKey = `data-quality/${process.env.indexNamespace ?? "unknown"}/${runId}/manifest.json`;
  const manifest = {
    runId,
    generatedAt: new Date().toISOString(),
    stage: process.env.indexNamespace ?? "unknown",
    indices: results.map((result) => ({
      index: result.index,
      objectKey: result.objectKey,
      rowCount: result.rowCount,
      columns: result.columns,
      violationsKey: result.violationsKey,
      violationCount: result.violationCount,
      ruleSummary: result.ruleSummary,
    })),
  };

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: manifestKey,
      Body: JSON.stringify(manifest, null, 2),
      ContentType: "application/json",
    }),
  );

  const recipients = normalizeRecipients(
    event.emailRecipients ?? process.env.DATA_QUALITY_DEFAULT_EMAILS,
  );

  if (recipients.length > 0) {
    const presignSeconds = Math.min(
      MAX_PRESIGN_SECONDS,
      Math.max(1, (event.presignDays ?? DEFAULT_PRESIGN_DAYS) * 24 * 60 * 60),
    );

    const manifestUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: manifestKey,
      }),
      { expiresIn: presignSeconds },
    );

    const fileLinks = await Promise.all(
      results.map(async (result) => {
        const url = await getSignedUrl(
          s3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: result.objectKey,
          }),
          { expiresIn: presignSeconds },
        );
        return { index: result.index, url, rows: result.rowCount };
      }),
    );

    const emailFrom = event.emailFrom ?? recipients[0];
    try {
      await sendSummaryEmail({
        sesClient,
        emailFrom,
        recipients,
        runId,
        stage: process.env.indexNamespace ?? "unknown",
        manifestUrl,
        fileLinks,
      });
    } catch (error: any) {
      const message = String(error?.message ?? "");
      if (error?.name === "MessageRejected" || message.includes("Email address is not verified")) {
        console.warn("Email not sent (address not verified).", { error: message });
      } else {
        throw error;
      }
    }
  }

  console.log("Data quality export completed", {
    runId,
    manifestKey,
    results,
  });

  return {
    runId,
    manifestKey,
    results,
  };
};

async function exportIndex(
  baseIndex: BaseIndex,
  opts: {
    runId: string;
    bucketName: string;
    pageSize: number;
    s3Client: S3Client;
  },
): Promise<ExportResult> {
  const { domain, index } = getDomainAndNamespace(baseIndex);
  const client = await getClient(domain);

  console.log("Collecting columns", { baseIndex, index });
  const columns = await collectColumns(client, index, opts.pageSize);

  const filePath = join("/tmp", `data-quality-${baseIndex}-${opts.runId}.csv`);
  const violationsPath = join("/tmp", `data-quality-${baseIndex}-${opts.runId}-violations.csv`);
  console.log("Writing CSV", { baseIndex, filePath });

  const violationsStream = createWriteStream(violationsPath, { encoding: "utf8" });
  const violationHeader = [
    "os_index",
    "os_id",
    "rule_id",
    "field",
    "severity",
    "expected",
    "actual",
    "message",
  ].join(",");
  await writeToStream(violationsStream, `${violationHeader}\n`);

  const { rowCount, violationCount, ruleSummary } = await writeCsvFile(
    client,
    baseIndex,
    index,
    columns,
    opts.pageSize,
    filePath,
    violationsStream,
  );

  violationsStream.end();
  await once(violationsStream, "finish");

  const objectKey = `data-quality/${process.env.indexNamespace ?? "unknown"}/${opts.runId}/${baseIndex}.csv`;
  const violationsKey = `data-quality/${process.env.indexNamespace ?? "unknown"}/${opts.runId}/violations-${baseIndex}.csv`;
  console.log("Uploading CSV", { baseIndex, objectKey });

  await opts.s3Client.send(
    new PutObjectCommand({
      Bucket: opts.bucketName,
      Key: objectKey,
      Body: createReadStream(filePath),
      ContentType: "text/csv",
    }),
  );

  await opts.s3Client.send(
    new PutObjectCommand({
      Bucket: opts.bucketName,
      Key: violationsKey,
      Body: createReadStream(violationsPath),
      ContentType: "text/csv",
    }),
  );

  return {
    index: baseIndex,
    objectKey,
    rowCount,
    columns,
    violationsKey,
    violationCount,
    ruleSummary,
  };
}

async function collectColumns(
  client: Awaited<ReturnType<typeof getClient>>,
  index: string,
  pageSize: number,
) {
  const columns = new Set<string>(["os_index", "os_id"]);

  await scanIndex(client, index, pageSize, async (hits) => {
    for (const hit of hits) {
      const flat = flattenRecord(hit?._source ?? {});
      Object.keys(flat).forEach((key) => columns.add(key));
    }
  });

  const sorted = Array.from(columns)
    .filter((col) => !["os_index", "os_id"].includes(col))
    .sort();
  return ["os_index", "os_id", ...sorted];
}

async function writeCsvFile(
  client: Awaited<ReturnType<typeof getClient>>,
  baseIndex: BaseIndex,
  index: string,
  columns: string[],
  pageSize: number,
  filePath: string,
  violationsStream: NodeJS.WritableStream,
) {
  const stream = createWriteStream(filePath, { encoding: "utf8" });
  let rowCount = 0;
  let violationCount = 0;
  const ruleSummary = getRuleSummary(baseIndex);

  await writeToStream(stream, `${columns.join(",")}\n`);

  await scanIndex(client, index, pageSize, async (hits) => {
    let buffer = "";
    let violationBuffer = "";
    for (const hit of hits) {
      const source = hit?._source ?? {};
      const flat = flattenRecord(source);
      const row = buildRow(hit, flat, columns);
      buffer += `${row}\n`;
      rowCount += 1;

      const violations = evaluateRecord(baseIndex, source);
      if (violations.length) {
        for (const violation of violations) {
          violationBuffer += buildViolationRow(hit, violation) + "\n";
          violationCount += 1;
        }
      }
    }
    if (buffer) {
      await writeToStream(stream, buffer);
    }
    if (violationBuffer) {
      await writeToStream(violationsStream, violationBuffer);
    }
  });

  stream.end();
  await once(stream, "finish");
  return { rowCount, violationCount, ruleSummary };
}

async function scanIndex(
  client: Awaited<ReturnType<typeof getClient>>,
  index: string,
  pageSize: number,
  onPage: (hits: any[]) => Promise<void>,
) {
  let scrollId: string | undefined;
  try {
    let response = await client.search({
      index,
      size: pageSize,
      scroll: "2m",
      sort: ["_doc"],
      body: {
        query: { match_all: {} },
      },
    });

    let decoded = decodeUtf8(response);
    let body = decoded?.body ?? decoded;
    let hits = body?.hits?.hits ?? [];
    scrollId = body?._scroll_id ?? body?.scroll_id;

    while (hits.length) {
      await onPage(hits);

      if (!scrollId) {
        break;
      }

      response = await client.scroll({
        scroll_id: scrollId,
        scroll: "2m",
      });
      decoded = decodeUtf8(response);
      body = decoded?.body ?? decoded;
      hits = body?.hits?.hits ?? [];
      scrollId = body?._scroll_id ?? body?.scroll_id ?? scrollId;
    }
  } finally {
    try {
      if (scrollId) {
        await client.clearScroll({ scroll_id: scrollId });
      }
    } catch (error) {
      console.warn("Failed to clear scroll", { index, error });
    }
  }
}

function flattenRecord(record: Record<string, any>, prefix = "", output: Record<string, any> = {}) {
  Object.entries(record).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    const path = prefix ? `${prefix}.${key}` : key;

    if (value === null || typeof value !== "object" || value instanceof Date) {
      output[path] = value;
      return;
    }

    if (Array.isArray(value)) {
      output[path] = value;
      return;
    }

    flattenRecord(value, path, output);
  });

  return output;
}

function buildRow(hit: any, flat: Record<string, any>, columns: string[]) {
  const row: Record<string, any> = {
    os_index: hit?._index ?? "",
    os_id: hit?._id ?? "",
    ...flat,
  };

  const values = columns.map((column) => formatValue(row[column]));
  return values.map(escapeCsv).join(",");
}

function buildViolationRow(hit: any, violation: RuleViolation) {
  const row = {
    os_index: hit?._index ?? "",
    os_id: hit?._id ?? "",
    rule_id: violation.ruleId,
    field: violation.field,
    severity: violation.severity,
    expected: violation.expected,
    actual: violation.actual,
    message: violation.message,
  };

  const values = [
    row.os_index,
    row.os_id,
    row.rule_id,
    row.field,
    row.severity,
    row.expected,
    row.actual,
    row.message,
  ].map((value) => escapeCsv(formatValue(value)));

  return values.join(",");
}

function formatValue(value: unknown): string {
  if (value === undefined) return "";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function escapeCsv(value: string): string {
  if (value.includes('"')) {
    value = value.replace(/"/g, '""');
  }
  if (/[\n\r,]/.test(value)) {
    return `"${value}"`;
  }
  return value;
}

function normalizeRecipients(input?: string[] | string) {
  if (!input) return [];
  const list = Array.isArray(input) ? input : input.split(",");
  const trimmed = list.map((item) => item.trim()).filter(Boolean);
  return Array.from(new Set(trimmed));
}

async function writeToStream(stream: NodeJS.WritableStream, data: string) {
  if (!stream.write(data)) {
    await once(stream, "drain");
  }
}

async function sendSummaryEmail(opts: {
  sesClient: SESClient;
  emailFrom?: string;
  recipients: string[];
  runId: string;
  stage: string;
  manifestUrl: string;
  fileLinks: { index: BaseIndex; url: string; rows: number }[];
}) {
  if (!opts.emailFrom) {
    console.warn("Email not sent: emailFrom is missing");
    return;
  }

  const subject = `[${opts.stage}] Data quality export ${opts.runId}`;
  const lines = [
    `Data quality export completed for stage ${opts.stage}.`,
    `Run ID: ${opts.runId}`,
    "",
    "Files:",
    ...opts.fileLinks.map((link) => `- ${link.index}: ${link.rows} rows\n  ${link.url}`),
    "",
    `Manifest: ${opts.manifestUrl}`,
  ];

  const body = lines.join("\n");

  await opts.sesClient.send(
    new SendEmailCommand({
      Destination: { ToAddresses: opts.recipients },
      Source: opts.emailFrom,
      Message: {
        Subject: { Data: subject },
        Body: { Text: { Data: body } },
      },
    }),
  );
}
