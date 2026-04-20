import { AttachmentArchiveIntegrityDiscrepancy } from "./integrity-types";
import { AttachmentArchiveFailureCode, AttachmentArchiveStatus } from "./types";

const CLEAN_STATUS = "CLEAN";
const TERMINAL_FAILURE_CODES = new Set<AttachmentArchiveFailureCode>([
  "ALL_ATTACHMENTS_UNAVAILABLE",
  "ATTACHMENT_NOT_CLEAN",
]);

export type AttachmentArchiveRepairClassification =
  | "repairable_scan_failure"
  | "terminal_exception_candidate"
  | "rebuild_only"
  | "residual_worker_failure";

export interface AttachmentArchiveRepairCurrentEntry {
  status: AttachmentArchiveStatus;
  failureCode?: AttachmentArchiveFailureCode;
}

export interface AttachmentArchiveRepairSourceInspection {
  exists: boolean;
  virusScanStatus?: string;
}

function parseCsvRows(content: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (character === '"') {
      if (inQuotes && content[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && character === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && content[index + 1] === "\n") {
        index += 1;
      }

      row.push(field);
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  row.push(field);
  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  return rows;
}

export function parseIntegrityReportCsv(content: string): AttachmentArchiveIntegrityDiscrepancy[] {
  const rows = parseCsvRows(content);
  const [header, ...dataRows] = rows;
  if (!header || header.length === 0) {
    return [];
  }

  return dataRows.map((row) => {
    const record = Object.fromEntries(
      header.map((column, index) => [column, row[index] === undefined ? "" : row[index]]),
    ) as Partial<AttachmentArchiveIntegrityDiscrepancy>;

    return {
      authority: String(record.authority || ""),
      packageId: String(record.packageId || ""),
      sectionId: String(record.sectionId || ""),
      cmsStatus: String(record.cmsStatus || ""),
      submissionDate: String(record.submissionDate || ""),
      issueScope: record.issueScope === "Download All" ? "Download All" : "Section",
      discrepancyType: String(record.discrepancyType || ""),
      expectedValue: String(record.expectedValue || ""),
      actualValue: String(record.actualValue || ""),
    };
  });
}

export function getIntegrityReportPackageIds(rows: AttachmentArchiveIntegrityDiscrepancy[]) {
  return Array.from(
    new Set(rows.map((row) => row.packageId).filter((packageId) => packageId.length > 0)),
  ).sort();
}

export function classifyPackageRepairCandidate({
  currentEntries,
  sourceInspections,
}: {
  currentEntries: AttachmentArchiveRepairCurrentEntry[];
  sourceInspections: AttachmentArchiveRepairSourceInspection[];
}): AttachmentArchiveRepairClassification {
  const failedEntries = currentEntries.filter((entry) => entry.status === "FAILED");
  if (failedEntries.length === 0) {
    return "rebuild_only";
  }

  const hasRepairableScanFailure = sourceInspections.some(
    (inspection) =>
      inspection.exists &&
      inspection.virusScanStatus !== undefined &&
      inspection.virusScanStatus !== CLEAN_STATUS,
  );
  if (hasRepairableScanFailure) {
    return "repairable_scan_failure";
  }

  const allFailedEntriesAreTerminal = failedEntries.every(
    (entry) => entry.failureCode && TERMINAL_FAILURE_CODES.has(entry.failureCode),
  );
  if (allFailedEntriesAreTerminal) {
    return "terminal_exception_candidate";
  }

  return "residual_worker_failure";
}

export function resolveQueuedPackageIds({
  inputPackageIds,
  packageIdsToRebuild,
  rebuildInputPackages,
}: {
  inputPackageIds: string[];
  packageIdsToRebuild: string[];
  rebuildInputPackages: boolean;
}) {
  return Array.from(
    new Set(rebuildInputPackages ? inputPackageIds : packageIdsToRebuild),
  ).sort();
}
