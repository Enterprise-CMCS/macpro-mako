import {
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Handler } from "aws-lambda";
import { once } from "events";
import { createReadStream, createWriteStream } from "fs";
import { decodeUtf8, getClient } from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { join } from "path";
import { BaseIndex } from "shared-types/opensearch";

import { checklist } from "./data-quality/checklist";
import { evaluateRecord, getRuleSummary, RuleSummary, RuleViolation } from "./data-quality/rules";

const DEFAULT_PAGE_SIZE = 1000;
const DEFAULT_PRESIGN_DAYS = 7;
const MAX_PRESIGN_SECONDS = 60 * 60 * 24 * 7;
const ATTACHMENT_CHECK_BATCH_SIZE = 25;
const DQ012B_SAMPLE_KEY_LIMIT = 50;
const DQ012B_UPLOAD_GRACE_HOURS = 24;
const DQ012B_UPLOAD_GRACE_MS = DQ012B_UPLOAD_GRACE_HOURS * 60 * 60 * 1000;
const CHECKLIST_BY_ID = new Map(checklist.map((rule) => [rule.checkId, rule]));
const DEFAULT_EXPORT_INDICES: BaseIndex[] = ["main", "changelog", "roles", "users"];
const DQ029_STATE_ROLES = new Set(["statesubmitter", "statesystemadmin"]);

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
  dq001DeletedKey?: string;
  dq001DeletedCount?: number;
  dq023InventoryKey?: string;
  dq023InventoryCount?: number;
};

type AttachmentReference = {
  bucket: string;
  key: string;
};

type AttachmentSnapshot = {
  osIndex: string;
  osId: string;
  recordId: string;
  isDeleted: boolean;
  hasAttachmentData: boolean;
  missingMetadataCount: number;
  references: AttachmentReference[];
};

type AttachmentCheckContext = {
  objectExistsCache: Map<string, Promise<boolean>>;
  s3ClientCache: Map<string, Promise<S3Client>>;
  mainRecordAttachmentState: Map<string, boolean>;
  referencedAttachmentKeysByBucket: Map<string, Set<string>>;
  processedAttachmentIndices: Set<BaseIndex>;
  dq012BCompleted: boolean;
  activeStateTerritoriesByEmail: Map<string, Set<string>>;
  processedAccessIndices: Set<BaseIndex>;
};

type UserSnapshot = {
  osIndex: string;
  osId: string;
  email: string;
};

type AttachmentRuleViolation = RuleViolation & {
  osIndex: string;
  osId: string;
};

type SupplementalExports = {
  dq001DeletedStream?: NodeJS.WritableStream;
  dq023InventoryStream?: NodeJS.WritableStream;
};

export const handler: Handler<ExportEvent> = async (event = {}) => {
  const bucketName = process.env.DATA_QUALITY_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("DATA_QUALITY_BUCKET_NAME must be set");
  }

  const runId = event.runId ?? new Date().toISOString().replace(/[:.]/g, "-");
  const indices: BaseIndex[] = normalizeIndices(
    event.indices?.length ? event.indices : DEFAULT_EXPORT_INDICES,
  );
  const pageSize = event.pageSize ?? DEFAULT_PAGE_SIZE;

  const s3Client = new S3Client({});
  const sesClient = new SESClient({});
  const attachmentCheckContext: AttachmentCheckContext = {
    objectExistsCache: new Map(),
    s3ClientCache: new Map(),
    mainRecordAttachmentState: new Map(),
    referencedAttachmentKeysByBucket: new Map(),
    processedAttachmentIndices: new Set(),
    dq012BCompleted: false,
    activeStateTerritoriesByEmail: new Map(),
    processedAccessIndices: new Set(),
  };

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
      attachmentCheckContext,
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
      dq001DeletedKey: result.dq001DeletedKey,
      dq001DeletedCount: result.dq001DeletedCount,
      dq023InventoryKey: result.dq023InventoryKey,
      dq023InventoryCount: result.dq023InventoryCount,
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
    attachmentCheckContext: AttachmentCheckContext;
  },
): Promise<ExportResult> {
  const { domain, index } = getDomainAndNamespace(baseIndex);
  const client = await getClient(domain);

  console.log("Collecting columns", { baseIndex, index });
  const columns = await collectColumns(client, index, opts.pageSize);

  const filePath = join("/tmp", `data-quality-${baseIndex}-${opts.runId}.csv`);
  const violationsPath = join("/tmp", `data-quality-${baseIndex}-${opts.runId}-violations.csv`);
  console.log("Writing CSV", { baseIndex, filePath });

  const supplementalExports: SupplementalExports = {};
  let dq001DeletedPath: string | undefined;
  let dq001DeletedKey: string | undefined;
  let dq023InventoryPath: string | undefined;
  let dq023InventoryKey: string | undefined;

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

  if (baseIndex === "main") {
    dq001DeletedPath = join("/tmp", `data-quality-${baseIndex}-${opts.runId}-dq001-deleted.csv`);
    dq023InventoryPath = join(
      "/tmp",
      `data-quality-${baseIndex}-${opts.runId}-dq023-legacy-inventory.csv`,
    );
    dq001DeletedKey = `data-quality/${process.env.indexNamespace ?? "unknown"}/${opts.runId}/dq001-deleted-main.csv`;
    dq023InventoryKey = `data-quality/${process.env.indexNamespace ?? "unknown"}/${opts.runId}/dq023-legacy-inventory-main.csv`;

    supplementalExports.dq001DeletedStream = createWriteStream(dq001DeletedPath, {
      encoding: "utf8",
    });
    supplementalExports.dq023InventoryStream = createWriteStream(dq023InventoryPath, {
      encoding: "utf8",
    });

    await writeToStream(supplementalExports.dq001DeletedStream, `${columns.join(",")}\n`);
    await writeToStream(supplementalExports.dq023InventoryStream, "dq_check,source,count,notes\n");
  }

  const { rowCount, violationCount, ruleSummary, dq001DeletedCount, dq023InventoryCount } =
    await writeCsvFile(
      client,
      baseIndex,
      index,
      columns,
      opts.pageSize,
      filePath,
      violationsStream,
      opts.attachmentCheckContext,
      supplementalExports,
    );

  violationsStream.end();
  await once(violationsStream, "finish");

  if (supplementalExports.dq001DeletedStream) {
    supplementalExports.dq001DeletedStream.end();
    await once(supplementalExports.dq001DeletedStream, "finish");
  }

  if (supplementalExports.dq023InventoryStream) {
    supplementalExports.dq023InventoryStream.end();
    await once(supplementalExports.dq023InventoryStream, "finish");
  }

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

  if (dq001DeletedPath && dq001DeletedKey) {
    await opts.s3Client.send(
      new PutObjectCommand({
        Bucket: opts.bucketName,
        Key: dq001DeletedKey,
        Body: createReadStream(dq001DeletedPath),
        ContentType: "text/csv",
      }),
    );
  }

  if (dq023InventoryPath && dq023InventoryKey) {
    await opts.s3Client.send(
      new PutObjectCommand({
        Bucket: opts.bucketName,
        Key: dq023InventoryKey,
        Body: createReadStream(dq023InventoryPath),
        ContentType: "text/csv",
      }),
    );
  }

  return {
    index: baseIndex,
    objectKey,
    rowCount,
    columns,
    violationsKey,
    violationCount,
    ruleSummary,
    dq001DeletedKey,
    dq001DeletedCount,
    dq023InventoryKey,
    dq023InventoryCount,
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
  attachmentCheckContext: AttachmentCheckContext,
  supplementalExports: SupplementalExports,
) {
  const stream = createWriteStream(filePath, { encoding: "utf8" });
  let rowCount = 0;
  let violationCount = 0;
  let dq001DeletedCount = 0;
  let dq023InventoryCount = 0;
  const ruleSummary = getRuleSummary(baseIndex);
  const attachmentSnapshots: AttachmentSnapshot[] = [];
  const legacySourceCounts = new Map<string, number>();
  const userSnapshots: UserSnapshot[] = [];

  await writeToStream(stream, `${columns.join(",")}\n`);

  await scanIndex(client, index, pageSize, async (hits) => {
    let buffer = "";
    let violationBuffer = "";
    let dq001DeletedBuffer = "";
    for (const hit of hits) {
      const source = hit?._source ?? {};
      const flat = flattenRecord(source);
      const row = buildRow(hit, flat, columns);
      buffer += `${row}\n`;
      rowCount += 1;

      if (
        baseIndex === "main" &&
        source.deleted === true &&
        supplementalExports.dq001DeletedStream
      ) {
        dq001DeletedBuffer += `${row}\n`;
        dq001DeletedCount += 1;
      }

      if (baseIndex === "main" || baseIndex === "changelog") {
        attachmentSnapshots.push(buildAttachmentSnapshot(hit, source));
      }

      if (baseIndex === "roles") {
        collectStateRoleAccess(source, attachmentCheckContext);
      }

      if (baseIndex === "users" && source.deleted !== true) {
        userSnapshots.push({
          osIndex: String(hit?._index ?? ""),
          osId: String(hit?._id ?? ""),
          email: String(source.email ?? "").trim(),
        });
      }

      if (baseIndex === "main" && source.deleted !== true) {
        const legacySource = classifyLegacySource(source);
        if (legacySource) {
          legacySourceCounts.set(legacySource, (legacySourceCounts.get(legacySource) ?? 0) + 1);
        }
      }

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
    if (dq001DeletedBuffer && supplementalExports.dq001DeletedStream) {
      await writeToStream(supplementalExports.dq001DeletedStream, dq001DeletedBuffer);
    }
  });

  if (baseIndex === "main" || baseIndex === "changelog") {
    const attachmentViolations = await evaluateAttachmentViolations(
      baseIndex,
      attachmentSnapshots,
      attachmentCheckContext,
    );

    if (attachmentViolations.length > 0) {
      const attachmentViolationRows = attachmentViolations
        .map((violation) =>
          buildViolationRow({ _index: violation.osIndex, _id: violation.osId }, violation),
        )
        .join("\n");
      await writeToStream(violationsStream, `${attachmentViolationRows}\n`);
      violationCount += attachmentViolations.length;
    }
  }

  if (baseIndex === "main" && supplementalExports.dq023InventoryStream) {
    const legacyInventoryRows = buildLegacyInventoryRows(legacySourceCounts);
    if (legacyInventoryRows.length > 0) {
      const serialized = legacyInventoryRows
        .map((row) =>
          [
            escapeCsv("DQ-023"),
            escapeCsv(row.source),
            escapeCsv(String(row.count)),
            escapeCsv(row.notes),
          ].join(","),
        )
        .join("\n");
      await writeToStream(supplementalExports.dq023InventoryStream, `${serialized}\n`);
      dq023InventoryCount += legacyInventoryRows.length;
    }
  }

  attachmentCheckContext.processedAccessIndices.add(baseIndex);
  if (baseIndex === "users") {
    const dq029Violations = buildDq029CrossIndexViolations(userSnapshots, attachmentCheckContext);
    if (dq029Violations.length > 0) {
      const dq029Rows = dq029Violations
        .map((violation) =>
          buildViolationRow({ _index: violation.osIndex, _id: violation.osId }, violation),
        )
        .join("\n");
      await writeToStream(violationsStream, `${dq029Rows}\n`);
      violationCount += dq029Violations.length;
    }
  }

  stream.end();
  await once(stream, "finish");
  return { rowCount, violationCount, ruleSummary, dq001DeletedCount, dq023InventoryCount };
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

function buildAttachmentSnapshot(hit: any, source: Record<string, any>): AttachmentSnapshot {
  const extracted = extractAttachmentReferences(source.attachments);
  return {
    osIndex: String(hit?._index ?? ""),
    osId: String(hit?._id ?? ""),
    recordId: getRecordId(source, hit),
    isDeleted: source.deleted === true,
    hasAttachmentData: extracted.hasAttachmentData,
    missingMetadataCount: extracted.missingMetadataCount,
    references: extracted.references,
  };
}

function extractAttachmentReferences(attachments: unknown): {
  hasAttachmentData: boolean;
  missingMetadataCount: number;
  references: AttachmentReference[];
} {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return {
      hasAttachmentData: false,
      missingMetadataCount: 0,
      references: [],
    };
  }

  const uniqueRefs = new Set<string>();
  const references: AttachmentReference[] = [];
  let missingMetadataCount = 0;

  for (const attachment of attachments) {
    const bucket = String((attachment as Record<string, any>)?.bucket ?? "").trim();
    const key = String((attachment as Record<string, any>)?.key ?? "").trim();

    if (!bucket || !key) {
      missingMetadataCount += 1;
      continue;
    }

    const refKey = `${bucket}:::${key}`;
    if (uniqueRefs.has(refKey)) continue;
    uniqueRefs.add(refKey);
    references.push({ bucket, key });
  }

  return {
    hasAttachmentData: true,
    missingMetadataCount,
    references,
  };
}

async function evaluateAttachmentViolations(
  baseIndex: BaseIndex,
  snapshots: AttachmentSnapshot[],
  context: AttachmentCheckContext,
): Promise<AttachmentRuleViolation[]> {
  const violations: AttachmentRuleViolation[] = [];
  const activeSnapshots = snapshots.filter(
    (snapshot) => !snapshot.isDeleted && Boolean(snapshot.osId) && Boolean(snapshot.recordId),
  );

  if (baseIndex === "main") {
    for (const snapshot of activeSnapshots) {
      context.mainRecordAttachmentState.set(
        snapshot.recordId,
        snapshot.hasAttachmentData && snapshot.references.length > 0,
      );
    }
  }

  const refsToCheck = new Map<string, AttachmentReference>();
  for (const snapshot of activeSnapshots) {
    if (!snapshot.hasAttachmentData || snapshot.references.length === 0) continue;
    for (const ref of snapshot.references) {
      const lookupKey = `${ref.bucket}:::${ref.key}`;
      refsToCheck.set(lookupKey, ref);
      const bucketSet =
        context.referencedAttachmentKeysByBucket.get(ref.bucket) ?? new Set<string>();
      bucketSet.add(ref.key);
      context.referencedAttachmentKeysByBucket.set(ref.bucket, bucketSet);
    }
  }

  const existsByRef = await resolveAttachmentExistenceMap(
    Array.from(refsToCheck.values()),
    context,
  );

  for (const snapshot of activeSnapshots) {
    if (!snapshot.hasAttachmentData) continue;

    if (snapshot.missingMetadataCount > 0) {
      violations.push(
        createAttachmentViolation(snapshot.osIndex, snapshot.osId, {
          ruleId: "DQ-012",
          actual: `${snapshot.missingMetadataCount} attachment entries missing bucket/key`,
          expected: "attachments[].bucket and attachments[].key populated",
          message: "Attachment metadata is missing bucket/key; cannot validate S3 object",
          severity: "error",
        }),
      );
    }

    let missingRefs = 0;
    for (const ref of snapshot.references) {
      const lookupKey = `${ref.bucket}:::${ref.key}`;
      const exists = existsByRef.get(lookupKey) ?? false;
      if (exists) continue;

      missingRefs += 1;
      violations.push(
        createAttachmentViolation(snapshot.osIndex, snapshot.osId, {
          ruleId: "DQ-012",
          actual: `${ref.bucket}/${ref.key}`,
          expected: "S3 object exists",
          message: "Attachment referenced in OpenSearch was not found in S3",
          severity: "error",
        }),
      );
    }

    if (snapshot.references.length + snapshot.missingMetadataCount > 0) {
      const missingAll =
        snapshot.references.length === 0 ? true : missingRefs === snapshot.references.length;

      if (missingAll) {
        violations.push(
          createAttachmentViolation(snapshot.osIndex, snapshot.osId, {
            ruleId: "DQ-012-A",
            actual: "No resolvable attachment object found in S3 for indexed attachments",
            expected: "At least one attachment object exists in S3",
            message: "Index has attachment data but S3 has no matching object",
            severity: "error",
          }),
        );
      }
    }

    if (baseIndex === "changelog" && snapshot.references.length > 0) {
      const mainHasAttachments = context.mainRecordAttachmentState.get(snapshot.recordId);
      if (mainHasAttachments === false) {
        violations.push(
          createAttachmentViolation(snapshot.osIndex, snapshot.osId, {
            ruleId: "DQ-012-C",
            actual: "changelog has attachments, main has none",
            expected: "main and changelog attachment presence aligned",
            message: "Attachment mismatch between main and changelog for record",
            severity: "warn",
          }),
        );
      }
    }
  }

  context.processedAttachmentIndices.add(baseIndex);
  const shouldRunDQ012B =
    !context.dq012BCompleted &&
    context.processedAttachmentIndices.has("main") &&
    context.processedAttachmentIndices.has("changelog");

  if (shouldRunDQ012B) {
    const dq012BViolations = await buildDq012BViolations(context);
    if (dq012BViolations.length > 0) {
      violations.push(...dq012BViolations);
    }
    context.dq012BCompleted = true;
  }

  return violations;
}

async function buildDq012BViolations(
  context: AttachmentCheckContext,
): Promise<AttachmentRuleViolation[]> {
  const bucket = process.env.ATTACHMENTS_BUCKET_NAME;
  if (!bucket) {
    console.warn("DQ-012-B skipped: ATTACHMENTS_BUCKET_NAME is not set");
    return [];
  }

  const referencedKeys = context.referencedAttachmentKeysByBucket.get(bucket) ?? new Set<string>();
  const s3Client = await getS3ClientForBucket(bucket, context);

  let continuationToken: string | undefined;
  let orphanCount = 0;
  const sampleKeys: string[] = [];
  const now = Date.now();

  do {
    const page = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    );

    for (const object of page.Contents ?? []) {
      const key = String(object.Key ?? "").trim();
      if (!key || key.endsWith("/")) continue;
      if (referencedKeys.has(key)) continue;

      const lastModified = object.LastModified?.getTime();
      if (lastModified && now - lastModified < DQ012B_UPLOAD_GRACE_MS) {
        continue;
      }

      orphanCount += 1;
      if (sampleKeys.length < DQ012B_SAMPLE_KEY_LIMIT) {
        sampleKeys.push(key);
      }
    }

    continuationToken = page.NextContinuationToken;
  } while (continuationToken);

  if (orphanCount === 0) {
    return [];
  }

  const violations: AttachmentRuleViolation[] = [
    createSyntheticViolation("DQ-012-B", {
      osIndex: `s3:${bucket}`,
      osId: "summary",
      actual: `${orphanCount} unreferenced objects`,
      expected: "Zero objects in S3 without OpenSearch attachment references",
      message: `Found ${orphanCount} attachment object(s) in S3 older than ${DQ012B_UPLOAD_GRACE_HOURS}h with no reference in main/changelog`,
      severity: "warn",
    }),
  ];

  for (const sampleKey of sampleKeys) {
    violations.push(
      createSyntheticViolation("DQ-012-B", {
        osIndex: `s3:${bucket}`,
        osId: sampleKey,
        actual: `${bucket}/${sampleKey}`,
        expected: "Object key linked to a main/changelog attachment reference",
        message: "Sample unreferenced attachment object in S3",
        severity: "warn",
      }),
    );
  }

  return violations;
}

async function resolveAttachmentExistenceMap(
  refs: AttachmentReference[],
  context: AttachmentCheckContext,
) {
  const existsByRef = new Map<string, boolean>();
  if (refs.length === 0) return existsByRef;

  await runWithConcurrency(refs, ATTACHMENT_CHECK_BATCH_SIZE, async (ref) => {
    const lookupKey = `${ref.bucket}:::${ref.key}`;
    const cached = context.objectExistsCache.get(lookupKey);
    const existsPromise = cached ?? checkAttachmentObjectExists(ref, context);
    if (!cached) {
      context.objectExistsCache.set(lookupKey, existsPromise);
    }
    const exists = await existsPromise;
    existsByRef.set(lookupKey, exists);
  });

  return existsByRef;
}

async function checkAttachmentObjectExists(
  ref: AttachmentReference,
  context: AttachmentCheckContext,
) {
  try {
    const s3Client = await getS3ClientForBucket(ref.bucket, context);
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: ref.bucket,
        Key: ref.key,
      }),
    );
    return true;
  } catch (error: any) {
    const statusCode = error?.$metadata?.httpStatusCode;
    if (
      statusCode === 403 ||
      statusCode === 404 ||
      error?.name === "NotFound" ||
      error?.name === "NoSuchKey"
    ) {
      return false;
    }

    console.warn("Unable to verify attachment in S3", {
      bucket: ref.bucket,
      key: ref.key,
      error: String(error?.message ?? error),
    });
    return false;
  }
}

async function getS3ClientForBucket(bucket: string, context: AttachmentCheckContext) {
  const cacheKey =
    bucket.startsWith("uploads") && process.env.LEGACY_S3_ACCESS_ROLE_ARN
      ? `legacy:${bucket}`
      : "default";

  const cachedClient = context.s3ClientCache.get(cacheKey);
  if (cachedClient) return cachedClient;

  const clientPromise = createS3ClientForBucket(bucket);
  context.s3ClientCache.set(cacheKey, clientPromise);
  return clientPromise;
}

async function createS3ClientForBucket(bucket: string) {
  if (bucket.startsWith("uploads") && process.env.LEGACY_S3_ACCESS_ROLE_ARN) {
    const stsClient = new STSClient({ region: process.env.AWS_REGION });
    const assumedRole = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: process.env.LEGACY_S3_ACCESS_ROLE_ARN,
        RoleSessionName: "data-quality-export-attachments",
      }),
    );

    const credentials = assumedRole.Credentials;
    if (!credentials?.AccessKeyId || !credentials?.SecretAccessKey) {
      throw new Error("Unable to assume legacy S3 access role for attachment checks");
    }

    return new S3Client({
      credentials: {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretAccessKey,
        sessionToken: credentials.SessionToken,
      },
    });
  }

  return new S3Client({});
}

function createAttachmentViolation(
  osIndex: string,
  osId: string,
  input: {
    ruleId: string;
    actual: string;
    expected: string;
    message: string;
    severity: "error" | "warn";
  },
): AttachmentRuleViolation {
  return createSyntheticViolation(input.ruleId, {
    osIndex,
    osId,
    actual: input.actual,
    expected: input.expected,
    message: input.message,
    severity: input.severity,
  });
}

function createSyntheticViolation(
  ruleId: string,
  input: {
    osIndex: string;
    osId: string;
    actual: string;
    expected: string;
    message: string;
    severity: "error" | "warn";
    field?: string;
  },
): AttachmentRuleViolation {
  const checklistRule = CHECKLIST_BY_ID.get(ruleId);
  return {
    osIndex: input.osIndex,
    osId: input.osId,
    ruleId,
    field: input.field ?? checklistRule?.fieldName ?? "attachments",
    severity: input.severity,
    expected: input.expected || checklistRule?.expectedResult || "",
    actual: input.actual,
    message: input.message || checklistRule?.checkDescription || "",
  };
}

function buildLegacyInventoryRows(legacySourceCounts: Map<string, number>) {
  const rows = Array.from(legacySourceCounts.entries()).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((sum, [, count]) => sum + count, 0);

  const inventoryRows: { source: string; count: number; notes: string }[] = [
    {
      source: "TOTAL",
      count: total,
      notes: "Legacy source inventory summary for main index",
    },
  ];

  for (const [source, count] of rows) {
    inventoryRows.push({
      source,
      count,
      notes: `Legacy source inventory count for ${source}`,
    });
  }

  return inventoryRows;
}

function collectStateRoleAccess(source: Record<string, any>, context: AttachmentCheckContext) {
  const role = normalizeString(source.role);
  if (!DQ029_STATE_ROLES.has(role)) return;

  if (normalizeString(source.status) !== "active") return;

  const email = normalizeString(source.email);
  if (!email) return;

  const territory = String(source.territory ?? "")
    .trim()
    .toUpperCase();
  if (!territory) return;

  const territories = context.activeStateTerritoriesByEmail.get(email) ?? new Set<string>();
  territories.add(territory);
  context.activeStateTerritoriesByEmail.set(email, territories);
}

function buildDq029CrossIndexViolations(
  users: UserSnapshot[],
  context: AttachmentCheckContext,
): AttachmentRuleViolation[] {
  if (!context.processedAccessIndices.has("roles")) {
    console.warn("DQ-029 skipped: roles index was not processed in this run");
    return [];
  }

  const violations: AttachmentRuleViolation[] = [];

  for (const user of users) {
    const email = normalizeString(user.email);
    if (!email) continue;

    const stateTerritories = context.activeStateTerritoriesByEmail.get(email);
    if (!stateTerritories || stateTerritories.size === 0) {
      continue;
    }

    const validStateTerritories = Array.from(stateTerritories).filter(isValidStateTerritory);
    if (validStateTerritories.length > 0) {
      continue;
    }

    violations.push(
      createSyntheticViolation("DQ-029", {
        osIndex: user.osIndex,
        osId: user.osId || email,
        actual: Array.from(stateTerritories).join("|") || "none",
        expected: "At least one active state role with a valid territory",
        message:
          "User has active state-user role(s) but no valid state territory assignment in roles index",
        severity: "error",
        field: "states",
      }),
    );
  }

  return violations;
}

function classifyLegacySource(record: Record<string, any>): string | null {
  const origin = normalizeString(record.origin);
  if (origin === "onemac" || origin === "mako") {
    return null;
  }

  if (origin === "onemaclegacy") {
    return "OneMACLegacy";
  }

  if (origin === "seatool") {
    return "SEATool";
  }

  const legacySignal = `${normalizeString(record.pk)} ${normalizeString(record.GSI1pk)} ${normalizeString(
    record.id,
  )}`;

  if (legacySignal.includes("macpro")) {
    return "MACPro";
  }

  if (legacySignal.includes("wms") || legacySignal.includes("mmdl")) {
    return "WMS/MMDL";
  }

  if (!isEmptyValue(record.GSI1pk) || !isEmptyValue(record.pk) || origin === "") {
    return "UnknownLegacy";
  }

  return null;
}

function getRecordId(source: Record<string, any>, hit: any) {
  const rawValue = source.id ?? source.packageId ?? source.pk ?? hit?._id ?? "";
  return String(rawValue).trim();
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  if (items.length === 0) return;
  let cursor = 0;
  const maxWorkers = Math.max(1, Math.min(concurrency, items.length));

  const workers = Array.from({ length: maxWorkers }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) {
        return;
      }
      await worker(items[index], index);
    }
  });

  await Promise.all(workers);
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

function normalizeString(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function isValidStateTerritory(value: string) {
  if (value === "N/A" || value === "ZZ") {
    return false;
  }
  return /^[A-Z]{2}$/.test(value);
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

function normalizeIndices(indices: BaseIndex[]): BaseIndex[] {
  const deduped: BaseIndex[] = [];
  for (const index of indices) {
    if (!deduped.includes(index)) {
      deduped.push(index);
    }
  }

  const ordered: BaseIndex[] = [];
  const priority: BaseIndex[] = ["main", "changelog", "roles", "users"];
  for (const index of priority) {
    if (deduped.includes(index)) {
      ordered.push(index);
    }
  }

  for (const index of deduped) {
    if (!ordered.includes(index)) {
      ordered.push(index);
    }
  }

  return ordered;
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
