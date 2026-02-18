import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Handler } from "aws-lambda";
import { createReadStream, createWriteStream } from "fs";
import { once } from "events";
import { join } from "path";

import { decodeUtf8, getClient } from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { BaseIndex } from "shared-types/opensearch";

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
};

export const handler: Handler<ExportEvent> = async (event = {}) => {
  const bucketName = process.env.DATA_QUALITY_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("DATA_QUALITY_BUCKET_NAME must be set");
  }

  const runId = event.runId ?? new Date().toISOString().replace(/[:.]/g, "-");
  const indices: BaseIndex[] = event.indices?.length
    ? event.indices
    : ["main", "changelog"];
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
    await sendSummaryEmail({
      sesClient,
      emailFrom,
      recipients,
      runId,
      stage: process.env.indexNamespace ?? "unknown",
      manifestUrl,
      fileLinks,
    });
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
  console.log("Writing CSV", { baseIndex, filePath });

  const rowCount = await writeCsvFile(client, index, columns, opts.pageSize, filePath);

  const objectKey = `data-quality/${process.env.indexNamespace ?? "unknown"}/${opts.runId}/${baseIndex}.csv`;
  console.log("Uploading CSV", { baseIndex, objectKey });

  await opts.s3Client.send(
    new PutObjectCommand({
      Bucket: opts.bucketName,
      Key: objectKey,
      Body: createReadStream(filePath),
      ContentType: "text/csv",
    }),
  );

  return {
    index: baseIndex,
    objectKey,
    rowCount,
    columns,
  };
}

async function collectColumns(client: Awaited<ReturnType<typeof getClient>>, index: string, pageSize: number) {
  const columns = new Set<string>(["os_index", "os_id"]);

  await scanIndex(client, index, pageSize, async (hits) => {
    for (const hit of hits) {
      const flat = flattenRecord(hit?._source ?? {});
      Object.keys(flat).forEach((key) => columns.add(key));
    }
  });

  const sorted = Array.from(columns).filter((col) => !["os_index", "os_id"].includes(col)).sort();
  return ["os_index", "os_id", ...sorted];
}

async function writeCsvFile(
  client: Awaited<ReturnType<typeof getClient>>,
  index: string,
  columns: string[],
  pageSize: number,
  filePath: string,
) {
  const stream = createWriteStream(filePath, { encoding: "utf8" });
  let rowCount = 0;

  await writeToStream(stream, `${columns.join(",")}\n`);

  await scanIndex(client, index, pageSize, async (hits) => {
    let buffer = "";
    for (const hit of hits) {
      const flat = flattenRecord(hit?._source ?? {});
      const row = buildRow(hit, flat, columns);
      buffer += `${row}\n`;
      rowCount += 1;
    }
    if (buffer) {
      await writeToStream(stream, buffer);
    }
  });

  stream.end();
  await once(stream, "finish");
  return rowCount;
}

async function scanIndex(
  client: Awaited<ReturnType<typeof getClient>>,
  index: string,
  pageSize: number,
  onPage: (hits: any[]) => Promise<void>,
) {
  const pitResponse = await client.openPointInTime({
    index,
    keep_alive: "5m",
  });
  const pitId = pitResponse.body?.id ?? pitResponse.body?.pit_id ?? pitResponse.body;

  if (!pitId) {
    throw new Error(`Failed to open PIT for index ${index}`);
  }

  let searchAfter: unknown[] | undefined;
  try {
    while (true) {
      const response = await client.search({
        size: pageSize,
        pit: { id: pitId, keep_alive: "5m" },
        sort: ["_shard_doc"],
        search_after: searchAfter,
        track_total_hits: false,
        query: { match_all: {} },
      });
      const decoded = decodeUtf8(response);
      const body = decoded?.body ?? decoded;
      const hits = body?.hits?.hits ?? [];

      if (!hits.length) {
        break;
      }

      await onPage(hits);
      searchAfter = hits[hits.length - 1]?.sort;
    }
  } finally {
    try {
      await client.closePointInTime({ body: { id: pitId } });
    } catch (error) {
      console.warn("Failed to close PIT", { index, error });
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
  const row = {
    os_index: hit?._index ?? "",
    os_id: hit?._id ?? "",
    ...flat,
  };

  const values = columns.map((column) => formatValue(row[column]));
  return values.map(escapeCsv).join(",");
}

function formatValue(value: unknown): string {
  if (value === undefined) return "";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function escapeCsv(value: string): string {
  if (value.includes("\"")) {
    value = value.replace(/\"/g, "\"\"");
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
