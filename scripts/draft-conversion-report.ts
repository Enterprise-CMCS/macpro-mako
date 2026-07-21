#!/usr/bin/env tsx

import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { SEATOOL_STATUS } from "shared-types";
import type { Document as MainDocument } from "shared-types/opensearch/main";

import { getClient } from "../lib/libs/opensearch-lib";

type OpenSearchClient = Awaited<ReturnType<typeof getClient>>;

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
  excludeStates?: string[];
  events?: string[];
  convertedOnly: boolean;
  quarterly: boolean;
  quarterlyOutput?: string;
  stateBreakdownOutput?: string;
  eventBreakdownOutput?: string;
  quarterField: "draft-created" | "submitted";
  shortDraftThresholdSeconds: number;
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

type MainSubmissionDocument = Pick<
  MainDocument,
  "authority" | "deleted" | "event" | "id" | "seatoolStatus" | "state" | "submissionDate"
>;

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
  draftLifecycleStatus: "Active draft" | "Deleted draft not submitted" | "Submitted from draft";
  category: "SPA" | "Waiver" | "Other";
  draftDurationUnderOneMinute: "yes" | "no" | "";
  draftCreatedAt: string;
  draftLastSavedAt: string;
  draftRecordChangedAt: string;
  convertedToSubmission: "yes" | "no";
  cmsStatus: string;
  stateStatus: string;
  submissionDate: string;
  draftCreatedToSubmit: string;
  lastDraftSaveToSubmit: string;
};

type QuarterlyMetricRow = {
  quarter: string;
  category: string;
  totalDrafts: string;
  activeDrafts: string;
  submittedFromDraft: string;
  deletedDraftsNotSubmitted: string;
  draftConversionRate: string;
  totalSubmissions: string;
  submittedUsingDraftRate: string;
  shortDraftSubmissions: string;
  averageDraftCreatedToSubmit: string;
  medianDraftCreatedToSubmit: string;
  averageLastDraftSaveToSubmit: string;
  medianLastDraftSaveToSubmit: string;
};

type BreakdownMetricRow = {
  quarter: string;
  category: string;
  value: string;
  totalDrafts: string;
  activeDrafts: string;
  submittedFromDraft: string;
  deletedDraftsNotSubmitted: string;
  draftConversionRate: string;
  shortDraftSubmissions: string;
};

type CsvColumn<TRow> = {
  key: keyof TRow;
  label: string;
};

const DEFAULT_PROJECT = "mako";
const DEFAULT_REGION = process.env.AWS_REGION || process.env.REGION_A || "us-east-1";
const DEFAULT_BATCH_SIZE = 500;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EVENT_LABELS: Record<string, string> = {
  "app-k": "App K",
  "capitated-amendment": "1915(b) Capitated Amendment",
  "capitated-initial": "1915(b) Capitated Initial",
  "capitated-renewal": "1915(b) Capitated Renewal",
  "contracting-amendment": "1915(b) Contracting Amendment",
  "contracting-initial": "1915(b) Contracting Initial",
  "contracting-renewal": "1915(b) Contracting Renewal",
  "new-chip-details-submission": "CHIP Details",
  "new-chip-submission": "CHIP SPA",
  "new-medicaid-submission": "Medicaid SPA",
  "temporary-extension": "Temporary Extension",
};
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

const csvColumns: Array<CsvColumn<ReportRow>> = [
  { key: "packageId", label: "Package ID" },
  { key: "state", label: "State" },
  { key: "event", label: "Submission Type" },
  { key: "authority", label: "Authority" },
  { key: "category", label: "Category" },
  { key: "draftLifecycleStatus", label: "Draft Lifecycle Status" },
  {
    key: "draftDurationUnderOneMinute",
    label: "Submitted Within 1 Minute of Draft Creation",
  },
  { key: "draftCreatedAt", label: "Draft Created Date" },
  { key: "draftLastSavedAt", label: "Last Draft Save Date" },
  { key: "draftRecordChangedAt", label: "Draft Record Changed Date" },
  { key: "cmsStatus", label: "CMS Status" },
  { key: "stateStatus", label: "State Status" },
  { key: "submissionDate", label: "Submission Date" },
  { key: "draftCreatedToSubmit", label: "Draft Created to Submission Time" },
  { key: "lastDraftSaveToSubmit", label: "Last Draft Save to Submission Time" },
];

const quarterlyCsvColumns: Array<CsvColumn<QuarterlyMetricRow>> = [
  { key: "quarter", label: "Quarter" },
  { key: "category", label: "Category" },
  { key: "totalDrafts", label: "Total Drafts" },
  { key: "activeDrafts", label: "Active Drafts" },
  { key: "submittedFromDraft", label: "Submitted From Draft" },
  { key: "deletedDraftsNotSubmitted", label: "Deleted Drafts Not Submitted" },
  { key: "draftConversionRate", label: "Draft Conversion Rate" },
  { key: "totalSubmissions", label: "Total Submissions" },
  { key: "submittedUsingDraftRate", label: "Submissions Using Draft Rate" },
  {
    key: "shortDraftSubmissions",
    label: "Submissions Within 1 Minute of Draft Creation",
  },
  { key: "averageDraftCreatedToSubmit", label: "Average Draft Created to Submission Time" },
  { key: "medianDraftCreatedToSubmit", label: "Median Draft Created to Submission Time" },
  { key: "averageLastDraftSaveToSubmit", label: "Average Last Draft Save to Submission Time" },
  { key: "medianLastDraftSaveToSubmit", label: "Median Last Draft Save to Submission Time" },
];

const stateBreakdownCsvColumns: Array<CsvColumn<BreakdownMetricRow>> = [
  { key: "quarter", label: "Quarter" },
  { key: "category", label: "Category" },
  { key: "value", label: "State" },
  { key: "totalDrafts", label: "Total Drafts" },
  { key: "activeDrafts", label: "Active Drafts" },
  { key: "submittedFromDraft", label: "Submitted From Draft" },
  { key: "deletedDraftsNotSubmitted", label: "Deleted Drafts Not Submitted" },
  { key: "draftConversionRate", label: "Draft Conversion Rate" },
  {
    key: "shortDraftSubmissions",
    label: "Submissions Within 1 Minute of Draft Creation",
  },
];

const eventBreakdownCsvColumns: Array<CsvColumn<BreakdownMetricRow>> = [
  { key: "quarter", label: "Quarter" },
  { key: "value", label: "Submission Type" },
  { key: "totalDrafts", label: "Total Drafts" },
  { key: "activeDrafts", label: "Active Drafts" },
  { key: "submittedFromDraft", label: "Submitted From Draft" },
  { key: "deletedDraftsNotSubmitted", label: "Deleted Drafts Not Submitted" },
  { key: "draftConversionRate", label: "Draft Conversion Rate" },
  {
    key: "shortDraftSubmissions",
    label: "Submissions Within 1 Minute of Draft Creation",
  },
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
  --exclude-state <states>     Comma-separated state filters to exclude, e.g. ZZ.
  --event <events>             Comma-separated event filters.
  --converted-only             Only output drafts with an active submitted main record.
  --quarterly                  Also write a quarterly metrics CSV.
  --quarterly-output <path>    Quarterly metrics CSV output path.
  --state-breakdown-output <path>
                              State breakdown CSV output path.
  --event-breakdown-output <path>
                              Event/type breakdown CSV output path.
  --quarter-field <field>      Quarter grouping field: draft-created or submitted. Default: draft-created.
  --short-draft-threshold <seconds>
                              Threshold used for draftDurationUnderOneMinute flag. Default: 60.
  --batch-size <number>        OpenSearch scroll/mget batch size. Default: ${DEFAULT_BATCH_SIZE}
  --help                       Show this help text.

Examples:
  bun run report:draft-conversions -- --stage production --quarterly --exclude-state ZZ
  bun run report:draft-conversions -- --stage val --from 2026-01-01 --state MD --quarterly
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
    quarterly: false,
    quarterField: "draft-created",
    shortDraftThresholdSeconds: 60,
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
      case "--exclude-state":
        options.excludeStates = parseListArg(argv[index + 1], (item) => item.toUpperCase());
        index += 1;
        break;
      case "--event":
        options.events = parseListArg(argv[index + 1]);
        index += 1;
        break;
      case "--converted-only":
        options.convertedOnly = true;
        break;
      case "--quarterly":
        options.quarterly = true;
        break;
      case "--quarterly-output":
        options.quarterlyOutput = argv[index + 1];
        index += 1;
        break;
      case "--state-breakdown-output":
        options.stateBreakdownOutput = argv[index + 1];
        index += 1;
        break;
      case "--event-breakdown-output":
        options.eventBreakdownOutput = argv[index + 1];
        index += 1;
        break;
      case "--quarter-field": {
        const value = argv[index + 1];
        if (value !== "draft-created" && value !== "submitted") {
          throw new Error(`Invalid quarter field: ${value}`);
        }
        options.quarterField = value;
        index += 1;
        break;
      }
      case "--short-draft-threshold": {
        const threshold = Number.parseInt(argv[index + 1] || "", 10);
        if (!Number.isFinite(threshold) || threshold < 0) {
          throw new Error(`Invalid short draft threshold: ${argv[index + 1]}`);
        }
        options.shortDraftThresholdSeconds = threshold;
        index += 1;
        break;
      }
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
  const mustNot: unknown[] = [];

  if (options.states?.length) {
    must.push({ terms: { "state.keyword": options.states } });
  }

  if (options.excludeStates?.length) {
    mustNot.push({ terms: { "state.keyword": options.excludeStates } });
  }

  if (options.events?.length) {
    must.push({ terms: { "event.keyword": options.events } });
  }

  return {
    query: {
      bool: {
        must,
        ...(mustNot.length > 0 && { must_not: mustNot }),
      },
    },
    sort: [{ "id.keyword": { order: "asc" } }],
    _source: {
      excludes: sourceExcludes,
    },
  };
}

function getMainSubmissionQuery({
  options,
  from,
  to,
}: {
  options: ScriptOptions;
  from?: Date;
  to?: Date;
}) {
  const must: unknown[] = [{ exists: { field: "submissionDate" } }];
  const mustNot: unknown[] = [
    { term: { deleted: true } },
    { term: { "seatoolStatus.keyword": SEATOOL_STATUS.DRAFT } },
  ];

  if (from || to) {
    must.push({
      range: {
        submissionDate: {
          ...(from && { gte: from.toISOString() }),
          ...(to && { lte: to.toISOString() }),
        },
      },
    });
  }

  if (options.states?.length) {
    must.push({ terms: { "state.keyword": options.states } });
  }

  if (options.excludeStates?.length) {
    mustNot.push({ terms: { "state.keyword": options.excludeStates } });
  }

  if (options.events?.length) {
    must.push({ terms: { "event.keyword": options.events } });
  }

  return {
    query: {
      bool: {
        must,
        must_not: mustNot,
      },
    },
    sort: [{ submissionDate: { order: "asc" } }, { "id.keyword": { order: "asc" } }],
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
  client: OpenSearchClient;
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
    let responseBody = initialResponse.body as unknown as SearchResponse<TDocument>;
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
      responseBody = scrollResponse.body as unknown as SearchResponse<TDocument>;
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

async function fetchDraftDocuments(
  client: OpenSearchClient,
  draftIndex: string,
  options: ScriptOptions,
) {
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
  client: OpenSearchClient;
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

async function fetchMainSubmissionDocuments({
  client,
  mainIndex,
  options,
  from,
  to,
}: {
  client: OpenSearchClient;
  mainIndex: string;
  options: ScriptOptions;
  from?: Date;
  to?: Date;
}) {
  const submissions: MainSubmissionDocument[] = [];
  const query = getMainSubmissionQuery({ options, from, to });

  for await (const hits of scrollDocuments<MainSubmissionDocument>({
    client,
    index: mainIndex,
    query,
    batchSize: options.batchSize,
  })) {
    submissions.push(...hits.map((hit) => hit._source));
    console.log(`Fetched ${submissions.length} submitted main records...`);
  }

  return submissions;
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

function formatDateTimeEastern(value: string) {
  const time = getTime(value);
  if (time === undefined) {
    return "";
  }

  const date = new Date(time);
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: "America/New_York",
    timeZoneName: "short",
    year: "numeric",
  }).formatToParts(date);
  const partByType = new Map(parts.map((part) => [part.type, part.value]));

  return `${partByType.get("year")}-${partByType.get("month")}-${partByType.get("day")} ${partByType.get("hour")}:${partByType.get("minute")}:${partByType.get("second")} ${partByType.get("timeZoneName")}`;
}

function getTime(value: string) {
  if (!value) {
    return undefined;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? undefined : time;
}

function getElapsedDaysNumber(start: string, end: string) {
  const startTime = getTime(start);
  const endTime = getTime(end);

  if (startTime === undefined || endTime === undefined) {
    return undefined;
  }

  return (endTime - startTime) / MS_PER_DAY;
}

function formatDurationFromDays(days: number | undefined) {
  if (days === undefined || days < 0) {
    return "";
  }

  let seconds = Math.round((days * MS_PER_DAY) / 1000);
  if (seconds < 60) {
    return `${seconds} sec`;
  }

  const dayCount = Math.floor(seconds / 86_400);
  seconds -= dayCount * 86_400;
  const hourCount = Math.floor(seconds / 3_600);
  seconds -= hourCount * 3_600;
  const minuteCount = Math.floor(seconds / 60);
  seconds -= minuteCount * 60;

  if (dayCount > 0) {
    return hourCount > 0
      ? `${dayCount} day${dayCount === 1 ? "" : "s"} ${hourCount} hr`
      : `${dayCount} day${dayCount === 1 ? "" : "s"}`;
  }

  if (hourCount > 0) {
    return minuteCount > 0 ? `${hourCount} hr ${minuteCount} min` : `${hourCount} hr`;
  }

  return seconds > 0 ? `${minuteCount} min ${seconds} sec` : `${minuteCount} min`;
}

function getElapsedDuration(start: string, end: string) {
  return formatDurationFromDays(getElapsedDaysNumber(start, end));
}

function getEventLabel(event: string | undefined) {
  if (!event) {
    return "";
  }

  return EVENT_LABELS[event] || event;
}

function getElapsedSeconds(start: string, end: string) {
  const days = getElapsedDaysNumber(start, end);
  return days === undefined ? undefined : (days * MS_PER_DAY) / 1000;
}

function getCategory({ authority, event }: { authority?: string; event?: string }) {
  const authorityText = (authority || "").toLowerCase();
  const eventText = (event || "").toLowerCase();

  if (
    authorityText.includes("spa") ||
    eventText.includes("chip") ||
    eventText.includes("medicaid")
  ) {
    return "SPA" as const;
  }

  if (
    authorityText.includes("1915") ||
    eventText.includes("app-k") ||
    eventText.includes("capitated") ||
    eventText.includes("contracting") ||
    eventText.includes("temporary-extension")
  ) {
    return "Waiver" as const;
  }

  return "Other" as const;
}

function isConvertedToSubmission(mainDocument: MainDocument | undefined) {
  return (
    mainDocument !== undefined &&
    mainDocument.deleted !== true &&
    mainDocument.seatoolStatus !== SEATOOL_STATUS.DRAFT &&
    Boolean(mainDocument.submissionDate)
  );
}

function getDraftLifecycleStatus({
  draft,
  convertedToSubmission,
}: {
  draft: DraftDocument;
  convertedToSubmission: boolean;
}): ReportRow["draftLifecycleStatus"] {
  if (convertedToSubmission) {
    return "Submitted from draft";
  }

  if (draft.deleted === true) {
    return "Deleted draft not submitted";
  }

  return "Active draft";
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

    const state = draft.state || draft.id?.slice(0, 2) || "";
    if (options.excludeStates?.includes(state)) {
      continue;
    }

    const mainDocument = mainDocumentsById.get(draft.id);
    const convertedToSubmission = isConvertedToSubmission(mainDocument);

    if (options.convertedOnly && !convertedToSubmission) {
      continue;
    }

    const submissionDate = asIso(mainDocument?.submissionDate);
    const draftCreatedToSubmitSeconds = getElapsedSeconds(draftCreatedAt, submissionDate);
    const category = getCategory({ authority: draft.authority, event: draft.event });

    rows.push({
      packageId: draft.id || "",
      state,
      event: getEventLabel(draft.event),
      authority: draft.authority || "",
      category,
      draftLifecycleStatus: getDraftLifecycleStatus({ draft, convertedToSubmission }),
      draftDurationUnderOneMinute:
        convertedToSubmission && draftCreatedToSubmitSeconds !== undefined
          ? draftCreatedToSubmitSeconds < options.shortDraftThresholdSeconds
            ? "yes"
            : "no"
          : "",
      draftCreatedAt,
      draftLastSavedAt,
      draftRecordChangedAt: asIso(draft.makoChangedDate || draft.changedDate || draft.statusDate),
      convertedToSubmission: convertedToSubmission ? "yes" : "no",
      cmsStatus: mainDocument?.cmsStatus || mainDocument?.seatoolStatus || "",
      stateStatus: mainDocument?.stateStatus || mainDocument?.seatoolStatus || "",
      submissionDate,
      draftCreatedToSubmit: getElapsedDuration(draftCreatedAt, submissionDate),
      lastDraftSaveToSubmit: getElapsedDuration(draftLastSavedAt, submissionDate),
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

function toCsv<T>(
  rows: T[],
  columns: Array<CsvColumn<T>>,
  formatValue: (header: keyof T, row: T) => string = (header, row) => String(row[header] ?? ""),
) {
  const lines = [
    columns.map((column) => escapeCsvValue(column.label)).join(","),
    ...rows.map((row) =>
      columns.map((column) => escapeCsvValue(formatValue(column.key, row))).join(","),
    ),
  ];

  return `${lines.join("\n")}\n`;
}

function formatReportCsvValue(header: keyof ReportRow, row: ReportRow) {
  const value = row[header];
  if (
    header === "draftCreatedAt" ||
    header === "draftLastSavedAt" ||
    header === "draftRecordChangedAt" ||
    header === "submissionDate"
  ) {
    return formatDateTimeEastern(String(value || ""));
  }

  return String(value ?? "");
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

function getDefaultQuarterlyOutputPath(indexNamespace: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeNamespace = indexNamespace.replace(/[^a-zA-Z0-9_-]/g, "-");
  return path.join(
    "docs",
    "local",
    "reports",
    `draft-conversion-quarterly-${safeNamespace}-${timestamp}.csv`,
  );
}

function getDefaultBreakdownOutputPath(indexNamespace: string, breakdownName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safeNamespace = indexNamespace.replace(/[^a-zA-Z0-9_-]/g, "-");
  return path.join(
    "docs",
    "local",
    "reports",
    `draft-conversion-${breakdownName}-${safeNamespace}-${timestamp}.csv`,
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

function getQuarter(value: string) {
  const time = getTime(value);
  if (time === undefined) {
    return "unknown";
  }

  const date = new Date(time);
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${date.getUTCFullYear()}-Q${quarter}`;
}

function getQuarterDateRange(quarter: string) {
  const match = /^(\d{4})-Q([1-4])$/.exec(quarter);
  if (!match) {
    return undefined;
  }

  const year = Number.parseInt(match[1], 10);
  const quarterNumber = Number.parseInt(match[2], 10);
  const startMonth = (quarterNumber - 1) * 3;

  return {
    from: new Date(Date.UTC(year, startMonth, 1, 0, 0, 0, 0)),
    to: new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59, 999)),
  };
}

function getQuarterSourceDate(row: ReportRow, quarterField: ScriptOptions["quarterField"]) {
  return quarterField === "submitted" ? row.submissionDate : row.draftCreatedAt;
}

function getQuarterFetchRange(rows: ReportRow[], quarterField: ScriptOptions["quarterField"]) {
  const ranges = rows
    .map((row) => getQuarter(getQuarterSourceDate(row, quarterField)))
    .filter((quarter) => quarter !== "unknown")
    .map(getQuarterDateRange)
    .filter((range): range is { from: Date; to: Date } => range !== undefined);

  if (ranges.length === 0) {
    return {};
  }

  return {
    from: new Date(Math.min(...ranges.map((range) => range.from.getTime()))),
    to: new Date(Math.max(...ranges.map((range) => range.to.getTime()))),
  };
}

function average(values: number[]) {
  if (values.length === 0) {
    return undefined;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]) {
  if (values.length === 0) {
    return undefined;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[midpoint];
  }

  return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
}

function isSubmittedFromDraft(row: ReportRow) {
  return row.draftLifecycleStatus === "Submitted from draft";
}

function isActiveDraft(row: ReportRow) {
  return row.draftLifecycleStatus === "Active draft";
}

function isDeletedDraftNotSubmitted(row: ReportRow) {
  return row.draftLifecycleStatus === "Deleted draft not submitted";
}

function getCategories(rows: ReportRow[], submissions: MainSubmissionDocument[] = []) {
  const categories = new Set<string>(["All", "SPA", "Waiver"]);

  for (const row of rows) {
    categories.add(row.category);
  }

  for (const submission of submissions) {
    categories.add(getCategory({ authority: submission.authority, event: submission.event }));
  }

  return [...categories].sort((left, right) => {
    const order = ["All", "SPA", "Waiver", "Other"];
    return order.indexOf(left) - order.indexOf(right) || left.localeCompare(right);
  });
}

function categoryMatches(category: string, value: string) {
  return category === "All" || category === value;
}

function getSubmissionCountsByQuarterAndCategory(submissions: MainSubmissionDocument[]) {
  const counts = new Map<string, number>();

  for (const submission of submissions) {
    const quarter = getQuarter(asIso(submission.submissionDate));
    if (quarter === "unknown") {
      continue;
    }

    const categories = [
      "All",
      getCategory({ authority: submission.authority, event: submission.event }),
    ];
    for (const category of categories) {
      const key = `${quarter}|${category}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  return counts;
}

function buildQuarterlyMetrics(
  rows: ReportRow[],
  quarterField: ScriptOptions["quarterField"],
  submissions: MainSubmissionDocument[] = [],
): QuarterlyMetricRow[] {
  const groupedRows = rows.reduce<Map<string, ReportRow[]>>((acc, row) => {
    const quarter = getQuarter(getQuarterSourceDate(row, quarterField));
    acc.set(quarter, [...(acc.get(quarter) || []), row]);
    return acc;
  }, new Map());
  const submissionCounts = getSubmissionCountsByQuarterAndCategory(submissions);
  const categories = getCategories(rows, submissions);

  return [...groupedRows.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .flatMap(([quarter, quarterRows]) =>
      categories
        .map((category) => {
          const categoryRows = quarterRows.filter((row) => categoryMatches(category, row.category));
          const totalSubmissions = submissionCounts.get(`${quarter}|${category}`) || 0;
          if (categoryRows.length === 0 && totalSubmissions === 0 && category !== "All") {
            return undefined;
          }

          const submittedRows = categoryRows.filter(isSubmittedFromDraft);
          const activeDrafts = categoryRows.filter(isActiveDraft).length;
          const deletedDraftsNotSubmitted = categoryRows.filter(isDeletedDraftNotSubmitted).length;
          const shortDraftSubmissions = submittedRows.filter(
            (row) => row.draftDurationUnderOneMinute === "yes",
          ).length;
          const draftCreatedDurations = submittedRows
            .map((row) => getElapsedDaysNumber(row.draftCreatedAt, row.submissionDate))
            .filter((value): value is number => value !== undefined);
          const lastSavedDurations = submittedRows
            .map((row) => getElapsedDaysNumber(row.draftLastSavedAt, row.submissionDate))
            .filter((value): value is number => value !== undefined);

          return {
            quarter,
            category,
            totalDrafts: String(categoryRows.length),
            activeDrafts: String(activeDrafts),
            submittedFromDraft: String(submittedRows.length),
            deletedDraftsNotSubmitted: String(deletedDraftsNotSubmitted),
            draftConversionRate: getPercent(submittedRows.length, categoryRows.length),
            totalSubmissions: String(totalSubmissions),
            submittedUsingDraftRate: getPercent(submittedRows.length, totalSubmissions),
            shortDraftSubmissions: String(shortDraftSubmissions),
            averageDraftCreatedToSubmit: formatDurationFromDays(average(draftCreatedDurations)),
            medianDraftCreatedToSubmit: formatDurationFromDays(median(draftCreatedDurations)),
            averageLastDraftSaveToSubmit: formatDurationFromDays(average(lastSavedDurations)),
            medianLastDraftSaveToSubmit: formatDurationFromDays(median(lastSavedDurations)),
          };
        })
        .filter((row): row is QuarterlyMetricRow => row !== undefined),
    );
}

function buildBreakdownMetrics({
  rows,
  quarterField,
  valueForRow,
  includeCategoryRows = true,
}: {
  rows: ReportRow[];
  quarterField: ScriptOptions["quarterField"];
  valueForRow: (row: ReportRow) => string;
  includeCategoryRows?: boolean;
}): BreakdownMetricRow[] {
  const groupedRows = rows.reduce<Map<string, ReportRow[]>>((acc, row) => {
    const quarter = getQuarter(getQuarterSourceDate(row, quarterField));
    const value = valueForRow(row) || "unknown";
    const categories = includeCategoryRows ? ["All", row.category] : ["All"];

    for (const category of categories) {
      const key = `${quarter}|${category}|${value}`;
      acc.set(key, [...(acc.get(key) || []), row]);
    }

    return acc;
  }, new Map());

  return [...groupedRows.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, groupRows]) => {
      const [quarter, category, value] = key.split("|");
      const submittedRows = groupRows.filter(isSubmittedFromDraft);
      const activeDrafts = groupRows.filter(isActiveDraft).length;
      const deletedDraftsNotSubmitted = groupRows.filter(isDeletedDraftNotSubmitted).length;

      return {
        quarter,
        category,
        value,
        totalDrafts: String(groupRows.length),
        activeDrafts: String(activeDrafts),
        submittedFromDraft: String(submittedRows.length),
        deletedDraftsNotSubmitted: String(deletedDraftsNotSubmitted),
        draftConversionRate: getPercent(submittedRows.length, groupRows.length),
        shortDraftSubmissions: String(
          submittedRows.filter((row) => row.draftDurationUnderOneMinute === "yes").length,
        ),
      };
    });
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
  quarterlyOutputPath,
  stateBreakdownOutputPath,
  eventBreakdownOutputPath,
  quarterlyMetrics,
  domain,
  draftIndex,
  mainIndex,
}: {
  rows: ReportRow[];
  draftCountBeforeFilters: number;
  outputPath: string;
  quarterlyOutputPath?: string;
  stateBreakdownOutputPath?: string;
  eventBreakdownOutputPath?: string;
  quarterlyMetrics?: QuarterlyMetricRow[];
  domain: string;
  draftIndex: string;
  mainIndex: string;
}) {
  const convertedCount = rows.filter(isSubmittedFromDraft).length;
  const activeDraftCount = rows.filter(isActiveDraft).length;
  const deletedNotConvertedCount = rows.filter(isDeletedDraftNotSubmitted).length;

  const byEvent = rows.reduce<Map<string, { drafts: number; converted: number }>>((acc, row) => {
    const key = row.event || "unknown";
    const current = acc.get(key) || { drafts: 0, converted: 0 };
    current.drafts += 1;
    if (isSubmittedFromDraft(row)) {
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

  if (quarterlyOutputPath && quarterlyMetrics) {
    console.log(`Quarterly metrics CSV output: ${quarterlyOutputPath}`);
    console.log(`Quarterly rows written: ${quarterlyMetrics.length}`);
  }
  if (stateBreakdownOutputPath) {
    console.log(`State breakdown CSV output: ${stateBreakdownOutputPath}`);
  }
  if (eventBreakdownOutputPath) {
    console.log(`Event/type breakdown CSV output: ${eventBreakdownOutputPath}`);
  }

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
  const csv = toCsv(rows, csvColumns, formatReportCsvValue);

  let quarterlyOutputPath: string | undefined;
  let stateBreakdownOutputPath: string | undefined;
  let eventBreakdownOutputPath: string | undefined;
  let quarterlyMetrics: QuarterlyMetricRow[] | undefined;

  await writeCsv(outputPath, csv);

  if (options.quarterly) {
    quarterlyOutputPath = options.quarterlyOutput || getDefaultQuarterlyOutputPath(indexNamespace);
    stateBreakdownOutputPath =
      options.stateBreakdownOutput || getDefaultBreakdownOutputPath(indexNamespace, "by-state");
    eventBreakdownOutputPath =
      options.eventBreakdownOutput || getDefaultBreakdownOutputPath(indexNamespace, "by-event");

    const submissionFetchRange = getQuarterFetchRange(rows, options.quarterField);
    console.log(`Fetching submitted main records for quarterly comparison from ${mainIndex}...`);
    const mainSubmissions = await fetchMainSubmissionDocuments({
      client,
      mainIndex,
      options,
      ...submissionFetchRange,
    });

    quarterlyMetrics = buildQuarterlyMetrics(rows, options.quarterField, mainSubmissions);
    await writeCsv(quarterlyOutputPath, toCsv(quarterlyMetrics, quarterlyCsvColumns));
    await writeCsv(
      stateBreakdownOutputPath,
      toCsv(
        buildBreakdownMetrics({
          rows,
          quarterField: options.quarterField,
          valueForRow: (row) => row.state,
        }),
        stateBreakdownCsvColumns,
      ),
    );
    await writeCsv(
      eventBreakdownOutputPath,
      toCsv(
        buildBreakdownMetrics({
          rows,
          quarterField: options.quarterField,
          valueForRow: (row) => row.event,
          includeCategoryRows: false,
        }),
        eventBreakdownCsvColumns,
      ),
    );
  }

  printSummary({
    rows,
    draftCountBeforeFilters: drafts.length,
    outputPath,
    quarterlyOutputPath,
    stateBreakdownOutputPath,
    eventBreakdownOutputPath,
    quarterlyMetrics,
    domain,
    draftIndex,
    mainIndex,
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
