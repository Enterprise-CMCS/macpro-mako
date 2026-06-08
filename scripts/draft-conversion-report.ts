#!/usr/bin/env tsx

import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import type { Client } from "@opensearch-project/opensearch";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { SEATOOL_STATUS } from "shared-types";
import type { Document as MainDocument } from "shared-types/opensearch/main";

import { getClient } from "../lib/libs/opensearch-lib";

type ScriptOptions = {
  stage?: string;
  project: string;
  region: string;
  domain?: string;
  indexNamespace?: string;
  output?: string;
  batchSize: number;
  from?: Date;
  to?: Date;
  states?: string[];
  events?: string[];
  convertedOnly: boolean;
};

type DraftDocument = Pick<
  MainDocument,
  | "authority"
  | "changedDate"
  | "deleted"
  | "event"
  | "id"
  | "makoChangedDate"
  | "seatoolStatus"
  | "state"
  | "statusDate"
> & {
  draft?: MainDocument["draft"];
};

type SearchHit<TDocument> = {
  _id: string;
  _source: TDocument;
};

type SearchResponse<TDocument> = {
  _scroll_id?: string;
  hits: {
    hits: SearchHit<TDocument>[];
    total?: {
      value: number;
      relation: string;
    };
  };
};

type MgetResponse<TDocument> = {
  docs: Array<
    | {
        found: true;
        _id: string;
        _source: TDocument;
      }
    | {
        found: false;
        _id: string;
      }
  >;
};

type ReportRow = {
  packageId: string;
  state: string;
  event: string;
  authority: string;
  draftRecordStatus: "active" | "deleted";
  draftCreatedAt: string;
  draftLastSavedAt: string;
  draftRecordChangedAt: string;
  convertedToSubmission: "yes" | "no";
  currentMainStatus: string;
  mainDeleted: "yes" | "no";
  submissionDate: string;
  daysFromDraftCreatedToSubmit: string;
  daysFromLastDraftSaveToSubmit: string;
};

const DEFAULT_PROJECT = "mako";
const DEFAULT_REGION = process.env.AWS_REGION || process.env.REGION_A || "us-east-1";
const DEFAULT_BATCH_SIZE = 500;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const sourceExcludes = [
  "attachments",
  "changelog",
  "appkChildren",
  "draft.data",
  "draft.createdByEmail",
  "draft.createdByName",
  "draft.updatedByEmail",
  "draft.updatedByName",
  "draft.draftOwnerEmail",
  "draft.draftOwnerName",
  "submitterEmail",
  "submitterName",
];

const csvHeaders: Array<keyof ReportRow> = [
  "packageId",
  "state",
  "event",
  "authority",
  "draftRecordStatus",
  "draftCreatedAt",
  "draftLastSavedAt",
  "draftRecordChangedAt",
  "convertedToSubmission",
  "currentMainStatus",
  "mainDeleted",
  "submissionDate",
  "daysFromDraftCreatedToSubmit",
  "daysFromLastDraftSaveToSubmit",
];

function printUsage() {
  console.log(`Usage: bun run report:draft-conversions -- [OPTIONS]

Build a draft-to-submission conversion CSV from OpenSearch draftmain and main indexes.

Options:
  --stage <stage>              Stage to report on. Also used as the index namespace.
  --project <project>          Project name for SSM lookup. Default: ${DEFAULT_PROJECT}
  --region <region>            AWS region for SSM/OpenSearch auth. Default: ${DEFAULT_REGION}
  --domain <url>               OpenSearch domain URL. Overrides SSM/env resolution.
  --index-namespace <prefix>   Index namespace. Overrides --stage/env resolution.
  --output <path>              CSV output path. Use "-" for stdout.
  --from <date>                Include drafts first saved on/after this ISO date.
  --to <date>                  Include drafts first saved on/before this ISO date.
  --state <states>             Comma-separated state filters, e.g. MD,VA.
  --event <events>             Comma-separated event filters.
  --converted-only             Only output drafts with an active submitted main record.
  --batch-size <number>        OpenSearch scroll/mget batch size. Default: ${DEFAULT_BATCH_SIZE}
  --help                       Show this help text.

Examples:
  bun run report:draft-conversions -- --stage main
  bun run report:draft-conversions -- --stage val --from 2026-01-01 --state MD
  bun run report:draft-conversions -- --domain https://example --index-namespace main --output -
`);
}

function parseDateArg(label: string, value: string | undefined, boundary: "start" | "end") {
  if (!value) {
    throw new Error(`Missing value for ${label}`);
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const normalizedValue = dateOnly
    ? `${value}T${boundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`
    : value;
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date for ${label}: ${value}`);
  }

  return date;
}

function parseListArg(
  value: string | undefined,
  transform: (item: string) => string = (item) => item,
) {
  if (!value) {
    return undefined;
  }

  const items = value
    .split(",")
    .map((item) => transform(item.trim()))
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

function parseArgs(argv: string[]): ScriptOptions {
  const options: ScriptOptions = {
    project: DEFAULT_PROJECT,
    region: DEFAULT_REGION,
    batchSize: DEFAULT_BATCH_SIZE,
    convertedOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
        break;
      case "--stage":
        options.stage = argv[index + 1];
        index += 1;
        break;
      case "--project":
        options.project = argv[index + 1] || options.project;
        index += 1;
        break;
      case "--region":
        options.region = argv[index + 1] || options.region;
        index += 1;
        break;
      case "--domain":
        options.domain = argv[index + 1];
        index += 1;
        break;
      case "--index-namespace":
        options.indexNamespace = argv[index + 1];
        index += 1;
        break;
      case "--output":
        options.output = argv[index + 1];
        index += 1;
        break;
      case "--from":
        options.from = parseDateArg(arg, argv[index + 1], "start");
        index += 1;
        break;
      case "--to":
        options.to = parseDateArg(arg, argv[index + 1], "end");
        index += 1;
        break;
      case "--state":
        options.states = parseListArg(argv[index + 1], (item) => item.toUpperCase());
        index += 1;
        break;
      case "--event":
        options.events = parseListArg(argv[index + 1]);
        index += 1;
        break;
      case "--converted-only":
        options.convertedOnly = true;
        break;
      case "--batch-size": {
        const batchSize = Number.parseInt(argv[index + 1] || "", 10);
        if (!Number.isFinite(batchSize) || batchSize <= 0) {
          throw new Error(`Invalid batch size: ${argv[index + 1]}`);
        }
        options.batchSize = batchSize;
        index += 1;
        break;
      }
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function ensureDomainProtocol(domain: string) {
  return domain.startsWith("http://") || domain.startsWith("https://")
    ? domain
    : `https://${domain}`;
}

function getDomainFromKibanaUrl(kibanaUrl: string | undefined) {
  if (!kibanaUrl) {
    return undefined;
  }

  const parsed = new URL(kibanaUrl);
  return parsed.origin;
}

async function resolveStageDomain({
  project,
  region,
  stage,
}: Pick<ScriptOptions, "project" | "region"> & { stage: string }) {
  const ssm = new SSMClient({ region });
  const response = await ssm.send(
    new GetParameterCommand({
      Name: `/${project}/${stage}/deployment-output`,
    }),
  );

  if (!response.Parameter?.Value) {
    throw new Error(`SSM parameter /${project}/${stage}/deployment-output did not have a value.`);
  }

  const deploymentOutput = JSON.parse(response.Parameter.Value) as { kibanaUrl?: string };
  const domain = getDomainFromKibanaUrl(deploymentOutput.kibanaUrl);

  if (!domain) {
    throw new Error(
      `Unable to resolve OpenSearch domain from /${project}/${stage}/deployment-output.`,
    );
  }

  return domain;
}

async function resolveRuntimeConfig(options: ScriptOptions) {
  const indexNamespace = options.indexNamespace || options.stage || process.env.indexNamespace;
  if (!indexNamespace) {
    throw new Error("Pass --stage or --index-namespace, or set process.env.indexNamespace.");
  }

  const domain =
    options.domain ||
    process.env.osDomain ||
    (options.stage
      ? await resolveStageDomain({
          project: options.project,
          region: options.region,
          stage: options.stage,
        })
      : undefined);

  if (!domain) {
    throw new Error("Pass --stage or --domain, or set process.env.osDomain.");
  }

  return {
    domain: ensureDomainProtocol(domain),
    draftIndex: `${indexNamespace}draftmain`,
    indexNamespace,
    mainIndex: `${indexNamespace}main`,
  };
}

function getOpenSearchQuery(options: ScriptOptions) {
  const must: unknown[] = [{ term: { "seatoolStatus.keyword": SEATOOL_STATUS.DRAFT } }];

  if (options.states?.length) {
    must.push({ terms: { "state.keyword": options.states } });
  }

  if (options.events?.length) {
    must.push({ terms: { "event.keyword": options.events } });
  }

  return {
    query: {
      bool: {
        must,
      },
    },
    sort: [{ "id.keyword": { order: "asc" } }],
    _source: {
      excludes: sourceExcludes,
    },
  };
}

async function* scrollDocuments<TDocument>({
  client,
  index,
  query,
  batchSize,
}: {
  client: Client;
  index: string;
  query: unknown;
  batchSize: number;
}): AsyncGenerator<SearchHit<TDocument>[], void, unknown> {
  let scrollId: string | undefined;

  try {
    const initialResponse = await client.search({
      index,
      scroll: "2m",
      size: batchSize,
      body: query,
    });
    let responseBody = initialResponse.body as SearchResponse<TDocument>;
    scrollId = responseBody._scroll_id;
    let hits = responseBody.hits.hits;

    while (hits.length > 0) {
      yield hits;

      if (!scrollId) {
        break;
      }

      const scrollResponse = await client.scroll({
        scroll_id: scrollId,
        scroll: "2m",
      });
      responseBody = scrollResponse.body as SearchResponse<TDocument>;
      scrollId = responseBody._scroll_id;
      hits = responseBody.hits.hits;
    }
  } finally {
    if (scrollId) {
      try {
        await client.clearScroll({ scroll_id: scrollId });
      } catch (error) {
        console.warn(`Warning: failed to clear OpenSearch scroll context: ${String(error)}`);
      }
    }
  }
}

async function fetchDraftDocuments(client: Client, draftIndex: string, options: ScriptOptions) {
  const drafts: DraftDocument[] = [];
  const query = getOpenSearchQuery(options);

  for await (const hits of scrollDocuments<DraftDocument>({
    client,
    index: draftIndex,
    query,
    batchSize: options.batchSize,
  })) {
    drafts.push(...hits.map((hit) => hit._source));
    console.log(`Fetched ${drafts.length} draft records...`);
  }

  return drafts;
}

async function fetchMainDocumentsById({
  client,
  mainIndex,
  ids,
  batchSize,
}: {
  client: Client;
  mainIndex: string;
  ids: string[];
  batchSize: number;
}) {
  const documentsById = new Map<string, MainDocument>();

  for (let index = 0; index < ids.length; index += batchSize) {
    const batchIds = ids.slice(index, index + batchSize);
    const response = await client.mget({
      index: mainIndex,
      _source_excludes: sourceExcludes.join(","),
      body: {
        ids: batchIds,
      },
    });
    const responseBody = response.body as MgetResponse<MainDocument>;

    for (const doc of responseBody.docs) {
      if (doc.found) {
        documentsById.set(doc._id, doc._source);
      }
    }

    console.log(
      `Checked ${Math.min(index + batchSize, ids.length)} of ${ids.length} main records...`,
    );
  }

  return documentsById;
}

function asIso(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function getTime(value: string) {
  if (!value) {
    return undefined;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}

function getElapsedDays(start: string, end: string) {
  const startTime = getTime(start);
  const endTime = getTime(end);

  if (startTime === undefined || endTime === undefined) {
    return "";
  }

  return ((endTime - startTime) / MS_PER_DAY).toFixed(2);
}

function isConvertedToSubmission(mainDocument: MainDocument | undefined) {
  return (
    mainDocument !== undefined &&
    mainDocument.deleted !== true &&
    mainDocument.seatoolStatus !== SEATOOL_STATUS.DRAFT &&
    Boolean(mainDocument.submissionDate)
  );
}

function buildReportRows({
  drafts,
  mainDocumentsById,
  options,
}: {
  drafts: DraftDocument[];
  mainDocumentsById: Map<string, MainDocument>;
  options: ScriptOptions;
}) {
  const rows: ReportRow[] = [];

  for (const draft of drafts) {
    const draftCreatedAt = asIso(
      draft.draft?.createdAt || draft.draft?.savedAt || draft.makoChangedDate,
    );
    const draftLastSavedAt = asIso(
      draft.draft?.updatedAt || draft.draft?.savedAt || draft.makoChangedDate,
    );

    const createdAtTime = getTime(draftCreatedAt);
    if (options.from && createdAtTime !== undefined && createdAtTime < options.from.getTime()) {
      continue;
    }
    if (options.to && createdAtTime !== undefined && createdAtTime > options.to.getTime()) {
      continue;
    }

    const mainDocument = mainDocumentsById.get(draft.id);
    const convertedToSubmission = isConvertedToSubmission(mainDocument);

    if (options.convertedOnly && !convertedToSubmission) {
      continue;
    }

    const submissionDate = asIso(mainDocument?.submissionDate);

    rows.push({
      packageId: draft.id || "",
      state: draft.state || draft.id?.slice(0, 2) || "",
      event: draft.event || "",
      authority: draft.authority || "",
      draftRecordStatus: draft.deleted === true ? "deleted" : "active",
      draftCreatedAt,
      draftLastSavedAt,
      draftRecordChangedAt: asIso(draft.makoChangedDate || draft.changedDate || draft.statusDate),
      convertedToSubmission: convertedToSubmission ? "yes" : "no",
      currentMainStatus: mainDocument?.seatoolStatus || "",
      mainDeleted: mainDocument?.deleted === true ? "yes" : "no",
      submissionDate,
      daysFromDraftCreatedToSubmit: getElapsedDays(draftCreatedAt, submissionDate),
      daysFromLastDraftSaveToSubmit: getElapsedDays(draftLastSavedAt, submissionDate),
    });
  }

  return rows.sort((left, right) => left.packageId.localeCompare(right.packageId));
}

function escapeCsvValue(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function toCsv(rows: ReportRow[]) {
  const lines = [
    csvHeaders.join(","),
    ...rows.map((row) =>
      csvHeaders.map((header) => escapeCsvValue(String(row[header] ?? ""))).join(","),
    ),
  ];

  return `${lines.join("\n")}\n`;
}

function getDefaultOutputPath(indexNamespace: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeNamespace = indexNamespace.replace(/[^a-zA-Z0-9_-]/g, "-");
  return path.join(
    "docs",
    "local",
    "reports",
    `draft-conversions-${safeNamespace}-${timestamp}.csv`,
  );
}

async function writeCsv(outputPath: string, csv: string) {
  if (outputPath === "-") {
    console.log(csv);
    return;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, csv);
}

function getPercent(numerator: number, denominator: number) {
  if (denominator === 0) {
    return "0.0%";
  }

  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function printSummary({
  rows,
  draftCountBeforeFilters,
  outputPath,
  domain,
  draftIndex,
  mainIndex,
}: {
  rows: ReportRow[];
  draftCountBeforeFilters: number;
  outputPath: string;
  domain: string;
  draftIndex: string;
  mainIndex: string;
}) {
  const convertedCount = rows.filter((row) => row.convertedToSubmission === "yes").length;
  const activeDraftCount = rows.filter((row) => row.draftRecordStatus === "active").length;
  const deletedNotConvertedCount = rows.filter(
    (row) => row.draftRecordStatus === "deleted" && row.convertedToSubmission === "no",
  ).length;

  const byEvent = rows.reduce<Map<string, { drafts: number; converted: number }>>((acc, row) => {
    const key = row.event || "unknown";
    const current = acc.get(key) || { drafts: 0, converted: 0 };
    current.drafts += 1;
    if (row.convertedToSubmission === "yes") {
      current.converted += 1;
    }
    acc.set(key, current);
    return acc;
  }, new Map());

  console.log("\nDraft conversion report");
  console.log(`OpenSearch domain: ${domain}`);
  console.log(`Draft index: ${draftIndex}`);
  console.log(`Main index: ${mainIndex}`);
  console.log(`Draft records fetched before local filters: ${draftCountBeforeFilters}`);
  console.log(`Rows written: ${rows.length}`);
  console.log(
    `Converted to active submitted main record: ${convertedCount} (${getPercent(convertedCount, rows.length)})`,
  );
  console.log(`Still active drafts: ${activeDraftCount}`);
  console.log(`Deleted drafts without active submitted main record: ${deletedNotConvertedCount}`);
  console.log(`CSV output: ${outputPath}`);

  if (byEvent.size > 0) {
    console.log("\nBy event");
    for (const [event, totals] of [...byEvent.entries()].sort(([left], [right]) =>
      left.localeCompare(right),
    )) {
      console.log(
        `${event}: ${totals.converted}/${totals.drafts} converted (${getPercent(
          totals.converted,
          totals.drafts,
        )})`,
      );
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { domain, draftIndex, indexNamespace, mainIndex } = await resolveRuntimeConfig(options);
  const outputPath = options.output || getDefaultOutputPath(indexNamespace);
  const client = await getClient(domain);

  console.log(`Fetching draft records from ${draftIndex}...`);
  const drafts = await fetchDraftDocuments(client, draftIndex, options);
  const ids = [...new Set(drafts.map((draft) => draft.id).filter(Boolean))];

  console.log(`Fetching matching main records from ${mainIndex}...`);
  const mainDocumentsById = await fetchMainDocumentsById({
    client,
    mainIndex,
    ids,
    batchSize: options.batchSize,
  });

  const rows = buildReportRows({
    drafts,
    mainDocumentsById,
    options,
  });
  const csv = toCsv(rows);

  await writeCsv(outputPath, csv);
  printSummary({
    rows,
    draftCountBeforeFilters: drafts.length,
    outputPath,
    domain,
    draftIndex,
    mainIndex,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
