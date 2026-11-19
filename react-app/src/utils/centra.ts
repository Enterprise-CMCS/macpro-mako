import {
  CE_HARDSHIP_EXCEPTION_AUTHORITY,
  CE_HARDSHIP_EXCEPTION_LABEL,
  CE_HARDSHIP_KIND_LABELS,
  type CeHardshipKindCode,
} from "shared-types";
import { formatDateToUTC } from "shared-utils";

import { BLANK_VALUE } from "@/consts";

import { removeUnderscoresAndCapitalize } from "./textHelpers";

const EPOCH_MILLISECONDS_THRESHOLD = 1e12;

export function isCeHardshipException(authority?: string | null): boolean {
  return authority === CE_HARDSHIP_EXCEPTION_AUTHORITY;
}

/** Package Details. Missing authorities stay empty so other package types render unchanged. */
export function formatPackageAuthorityLabel(authority?: string | null): string | null | undefined {
  if (isCeHardshipException(authority)) return CE_HARDSHIP_EXCEPTION_LABEL;
  return authority;
}

/** SPAs grid Authority column. Non-CEntra values keep the existing display helper. */
export function formatSpaGridAuthority(authority?: string | null): string {
  if (!authority) return BLANK_VALUE;
  if (isCeHardshipException(authority)) return CE_HARDSHIP_EXCEPTION_LABEL;
  return removeUnderscoresAndCapitalize(authority);
}

export function formatHardshipKindLabel(kind?: string | null): string {
  if (!kind) return BLANK_VALUE;
  if (Object.prototype.hasOwnProperty.call(CE_HARDSHIP_KIND_LABELS, kind)) {
    return CE_HARDSHIP_KIND_LABELS[kind as CeHardshipKindCode];
  }
  return BLANK_VALUE;
}

type CentraRecord = {
  hardshipKind?: string | null;
  proposedDate?: unknown;
  draft?: { data?: Record<string, unknown> | null } | null;
};

function isPresentDate(value: unknown): value is string | number {
  if (typeof value === "number") return Number.isFinite(value);
  return typeof value === "string" && value.trim().length > 0;
}

export function readCentraHardshipKind(record: CentraRecord): string | undefined {
  if (record.hardshipKind) return record.hardshipKind;
  const draftKind = record.draft?.data?.hardshipKind;
  return typeof draftKind === "string" && draftKind.trim() ? draftKind : undefined;
}

export function readCentraSubmissionDate(record: CentraRecord): string | number | undefined {
  if (isPresentDate(record.proposedDate)) return record.proposedDate;
  const draftDate = record.draft?.data?.proposedEffectiveDate;
  return isPresentDate(draftDate) ? draftDate : undefined;
}

export function formatCentraSubmissionDate(value: string | number | undefined): string {
  if (!isPresentDate(value)) return BLANK_VALUE;
  const normalized =
    typeof value === "number" && value < EPOCH_MILLISECONDS_THRESHOLD ? value * 1000 : value;
  return formatDateToUTC(normalized);
}
