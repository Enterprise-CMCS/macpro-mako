import { search } from "libs/opensearch-lib";
import { getDomainAndNamespace } from "libs/utils";
import { Authority, SEATOOL_STATUS, SMART_RECORD_TYPE } from "shared-types";

import { daysSinceSubmission, isPastMissingRecordCadence } from "./cadence";
import { MailboxGroup } from "./recipients";

export const MISSING_RECORD_SEARCH_PAGE_SIZE = 500;

export interface MissingRecordSource {
  id?: unknown;
  submissionDate?: unknown;
  authority?: unknown;
  origin?: unknown;
  deleted?: unknown;
  actionType?: unknown;
  event?: unknown;
  seatoolStatus?: unknown;
  cmsStatus?: unknown;
  stateStatus?: unknown;
  changed_date?: unknown;
  changedDate?: unknown;
  smartRecordType?: unknown;
}

export interface MissingRecordCandidate {
  id: string;
  submissionDate: string | number;
  authority: Authority;
  daysSinceSubmit: number;
}

export interface MissingRecordHit {
  _id?: string;
  _source?: MissingRecordSource;
}

const SUBMITTED_DISPLAY_STATUSES = new Set([
  SEATOOL_STATUS.SUBMITTED.toLowerCase(),
  "submitted - intake needed",
  "submitted-intake needed",
]);

export function isValidPackageId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function parseAuthority(value: unknown): Authority | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  switch (normalized) {
    case Authority.MED_SPA:
      return Authority.MED_SPA;
    case Authority.CHIP_SPA:
      return Authority.CHIP_SPA;
    case Authority["1915b"]:
    case "1915b":
      return Authority["1915b"];
    case Authority["1915c"]:
    case "1915c":
      return Authority["1915c"];
    default:
      return undefined;
  }
}

export function mailboxGroupForAuthority(authority: Authority): MailboxGroup {
  switch (authority) {
    case Authority.MED_SPA:
      return "medicaid-spa";
    case Authority.CHIP_SPA:
      return "chip-spa";
    case Authority["1915b"]:
    case Authority["1915c"]:
      return "waiver";
    default: {
      const exhaustive: never = authority;
      throw new Error(`Unexpected authority: ${exhaustive}`);
    }
  }
}

export function isSubmittedStatus(record: MissingRecordSource): boolean {
  const statuses = [record.seatoolStatus, record.cmsStatus, record.stateStatus]
    .filter((status): status is string => typeof status === "string")
    .map((status) => status.trim().toLowerCase().replace(/\s+/g, " "));

  return statuses.some((status) => SUBMITTED_DISPLAY_STATUSES.has(status));
}

export function isTemporaryExtension(record: MissingRecordSource): boolean {
  const actionType = typeof record.actionType === "string" ? record.actionType : "";
  const event = typeof record.event === "string" ? record.event : "";
  return (
    actionType === "Extend" ||
    actionType === "temporary-extension" ||
    event === "temporary-extension"
  );
}

export function isSmartReservation(record: MissingRecordSource): boolean {
  return record.origin === "SMART" || record.smartRecordType === SMART_RECORD_TYPE.RESERVATION;
}

export function hasSeatoolIngestMarker(record: MissingRecordSource): boolean {
  const marker = record.changed_date;
  return marker !== undefined && marker !== null && marker !== "";
}

export function isDraftRecord(record: MissingRecordSource): boolean {
  return record.seatoolStatus === SEATOOL_STATUS.DRAFT;
}

export function isMissingRecordCandidate(record: MissingRecordSource): boolean {
  return (
    isValidPackageId(record.id) &&
    record.origin === "OneMAC" &&
    record.deleted !== true &&
    !isDraftRecord(record) &&
    !isTemporaryExtension(record) &&
    !isSmartReservation(record) &&
    !hasSeatoolIngestMarker(record) &&
    isSubmittedStatus(record)
  );
}

export function toMissingRecordCandidate(
  record: MissingRecordSource,
  now: Date = new Date(),
): MissingRecordCandidate | undefined {
  if (!isMissingRecordCandidate(record) || !isValidPackageId(record.id)) {
    return undefined;
  }

  const authority = parseAuthority(record.authority);
  if (!authority) {
    return undefined;
  }

  if (typeof record.submissionDate !== "string" && typeof record.submissionDate !== "number") {
    return undefined;
  }

  if (!isPastMissingRecordCadence(record.submissionDate, now)) {
    return undefined;
  }

  const daysSinceSubmit = daysSinceSubmission(record.submissionDate, now);
  if (daysSinceSubmit === null) {
    return undefined;
  }

  return {
    id: record.id.trim(),
    submissionDate: record.submissionDate,
    authority,
    daysSinceSubmit,
  };
}

export function groupCandidatesByMailbox(
  candidates: MissingRecordCandidate[],
): Record<MailboxGroup, MissingRecordCandidate[]> {
  const groups: Record<MailboxGroup, MissingRecordCandidate[]> = {
    "medicaid-spa": [],
    "chip-spa": [],
    waiver: [],
  };

  for (const candidate of candidates) {
    groups[mailboxGroupForAuthority(candidate.authority)].push(candidate);
  }

  return groups;
}

export function buildMissingRecordSearchQuery(from: number, size: number) {
  return {
    from,
    size,
    _source: [
      "id",
      "submissionDate",
      "authority",
      "origin",
      "deleted",
      "actionType",
      "event",
      "seatoolStatus",
      "cmsStatus",
      "stateStatus",
      "changed_date",
      "changedDate",
      "smartRecordType",
    ],
    query: {
      bool: {
        must: [
          { exists: { field: "id" } },
          { term: { "origin.keyword": "OneMAC" } },
          {
            bool: {
              should: [
                { term: { "seatoolStatus.keyword": SEATOOL_STATUS.SUBMITTED } },
                { term: { "cmsStatus.keyword": SEATOOL_STATUS.SUBMITTED } },
                { term: { "cmsStatus.keyword": "Submitted - Intake Needed" } },
                { term: { "stateStatus.keyword": SEATOOL_STATUS.SUBMITTED } },
              ],
              minimum_should_match: 1,
            },
          },
        ],
        must_not: [
          { term: { deleted: true } },
          { term: { "seatoolStatus.keyword": SEATOOL_STATUS.DRAFT } },
          { term: { "actionType.keyword": "Extend" } },
          { term: { "actionType.keyword": "temporary-extension" } },
          { term: { "event.keyword": "temporary-extension" } },
          { term: { "origin.keyword": "SMART" } },
          { term: { "smartRecordType.keyword": SMART_RECORD_TYPE.RESERVATION } },
          { exists: { field: "changed_date" } },
        ],
      },
    },
  };
}

export async function fetchMissingRecordCandidates(
  now: Date = new Date(),
): Promise<MissingRecordCandidate[]> {
  const { domain, index } = getDomainAndNamespace("main");
  const candidates: MissingRecordCandidate[] = [];
  let from = 0;

  while (true) {
    const response = (await search(
      domain,
      index,
      buildMissingRecordSearchQuery(from, MISSING_RECORD_SEARCH_PAGE_SIZE),
    )) as {
      hits?: { hits?: MissingRecordHit[] };
    };
    const hits = response.hits?.hits ?? [];

    for (const hit of hits) {
      const source: MissingRecordSource = {
        ...(hit._source ?? {}),
        id: hit._source?.id ?? hit._id,
      };
      const candidate = toMissingRecordCandidate(source, now);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    if (hits.length < MISSING_RECORD_SEARCH_PAGE_SIZE) {
      break;
    }

    from += MISSING_RECORD_SEARCH_PAGE_SIZE;
  }

  return candidates;
}
