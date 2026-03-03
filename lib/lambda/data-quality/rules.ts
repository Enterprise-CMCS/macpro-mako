import { SEATOOL_STATUS, statusToDisplayToCmsUser, statusToDisplayToStateUser } from "shared-types";
import { BaseIndex } from "shared-types/opensearch";

import { checklist, ChecklistItem } from "./checklist";

export type RuleSeverity = "error" | "warn";

export type RuleViolation = {
  ruleId: string;
  field: string;
  severity: RuleSeverity;
  expected: string;
  actual: string;
  message: string;
};

export type RuleSummary = {
  total: number;
  auto: number;
  manual: number;
  automatedRuleIds: string[];
  manualRuleIds: string[];
};

type RuleCheck = (record: Record<string, any>, rule: ChecklistItem) => RuleViolation[];

const VALID_AUTHORITIES = new Set(["medicaid spa", "chip spa", "1915(b)", "1915(c)"]);

const VALID_ORIGINS = new Set(["OneMAC", "SEATool", "OneMACLegacy", "mako"]);

const VALID_STATES = new Set([
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
  "AS",
  "GU",
  "MP",
  "PR",
  "VI",
]);

const VALID_CURRENT_STATUS_VALUES = new Set([
  ...Object.values(SEATOOL_STATUS),
  ...Object.values(statusToDisplayToStateUser),
  ...Object.values(statusToDisplayToCmsUser),
  "TE Requested",
  "Inactivated",
  "Waiver Terminated",
]);

const MIN_EPOCH_MS = 946684800000; // 2000-01-01
const MAX_EPOCH_MS = 4102444800000; // 2100-01-01

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTO_RULE_CHECKS: Record<string, RuleCheck> = {
  "DQ-001": (record, rule) => {
    if (record.deleted === true) {
      return [
        violation(
          rule,
          "deleted=true record requires documented reason",
          "true",
          "documented reason",
          "warn",
        ),
      ];
    }
    return [];
  },
  "DQ-002": (record, rule) =>
    shouldCheckOrigin(record) && isEmpty(record.origin)
      ? [
          violation(
            rule,
            "origin is null or empty",
            formatValue(record.origin),
            "non-empty",
            "error",
          ),
        ]
      : [],
  "DQ-003": (record, rule) =>
    shouldCheckLegacyKey(record) && isEmpty(record.GSI1pk)
      ? [
          violation(
            rule,
            "GSI1pk is null or empty",
            formatValue(record.GSI1pk),
            "non-empty",
            "error",
          ),
        ]
      : [],
  "DQ-007": (record, rule) =>
    isOneMacOrigin(record) && isEmpty(record.submissionDate)
      ? [
          violation(
            rule,
            "submissionDate is null for OneMAC origin",
            formatValue(record.submissionDate),
            "non-empty",
            "error",
          ),
        ]
      : [],
  "DQ-008": (record, rule) => {
    if (isPending(record.proposedDate)) {
      return [
        violation(
          rule,
          "proposedDate is Pending",
          formatValue(record.proposedDate),
          "not Pending",
          "warn",
        ),
      ];
    }
    return [];
  },
  "DQ-009": (record, rule) => {
    if (!isOneMacOrigin(record) || !isMedicaidSpa(record.authority)) return [];
    if (isEmpty(record.proposedDate)) {
      return [
        violation(
          rule,
          "proposedDate is null for Medicaid SPA",
          formatValue(record.proposedDate),
          "non-empty",
          "error",
        ),
      ];
    }
    if (isPending(record.proposedDate)) {
      return [
        violation(
          rule,
          "proposedDate is Pending for Medicaid SPA",
          formatValue(record.proposedDate),
          "non-Pending",
          "warn",
        ),
      ];
    }
    return [];
  },
  "DQ-010": (record, rule) =>
    requiresSubmitterIdentity(record) && isEmpty(record.submitterName)
      ? [
          violation(
            rule,
            "submitterName is null for non-NOSO",
            formatValue(record.submitterName),
            "non-empty",
            "error",
          ),
        ]
      : [],
  "DQ-011": (record, rule) =>
    requiresSubmitterIdentity(record) && isEmpty(record.submitterEmail)
      ? [
          violation(
            rule,
            "submitterEmail is null for non-NOSO",
            formatValue(record.submitterEmail),
            "non-empty",
            "error",
          ),
        ]
      : [],
  "DQ-013": (record, rule) =>
    !isEmpty(record.submissionDate) && !isValidTimestamp(record.submissionDate)
      ? [
          violation(
            rule,
            "submissionDate is not a valid ISO date or epoch milliseconds timestamp",
            formatValue(record.submissionDate),
            "ISO date or epoch ms",
            "error",
          ),
        ]
      : [],
  "DQ-014": (record, rule) =>
    !isEmpty(record.statusDate) && !isValidTimestamp(record.statusDate)
      ? [
          violation(
            rule,
            "statusDate is not a valid ISO date or epoch milliseconds timestamp",
            formatValue(record.statusDate),
            "ISO date or epoch ms",
            "error",
          ),
        ]
      : [],
  "DQ-015": (record, rule) =>
    !isEmpty(record.authority) && !VALID_AUTHORITIES.has(normalize(record.authority))
      ? [
          violation(
            rule,
            "authority has invalid value",
            formatValue(record.authority),
            "valid authority",
            "error",
          ),
        ]
      : [],
  "DQ-016": (record, rule) =>
    !isEmpty(record.state) && !VALID_STATES.has(String(record.state).toUpperCase())
      ? [
          violation(
            rule,
            "state has invalid code",
            formatValue(record.state),
            "valid state code",
            "error",
          ),
        ]
      : [],
  "DQ-017": (record, rule) =>
    !isEmpty(record.currentStatus) && !VALID_CURRENT_STATUS_VALUES.has(String(record.currentStatus))
      ? [
          violation(
            rule,
            "currentStatus has an unmapped value",
            formatValue(record.currentStatus),
            "mapped currentStatus",
            "error",
          ),
        ]
      : [],
  "DQ-018": (record, rule) =>
    !isEmpty(record.submitterEmail) && !EMAIL_REGEX.test(String(record.submitterEmail))
      ? [
          violation(
            rule,
            "submitterEmail has invalid format",
            formatValue(record.submitterEmail),
            "valid email",
            "error",
          ),
        ]
      : [],
  "DQ-020": (record, rule) => {
    const formalRaiField = !isEmpty(record.formalRaiReceivedDate)
      ? "formalRaiReceivedDate"
      : "raiReceivedDate";
    const formalRaiValue =
      formalRaiField === "formalRaiReceivedDate"
        ? record.formalRaiReceivedDate
        : record.raiReceivedDate;

    if (isEmpty(formalRaiValue)) return [];
    if (!isValidTimestamp(formalRaiValue)) {
      return [
        violation(
          rule,
          `${formalRaiField} is not a valid ISO date or epoch milliseconds timestamp`,
          formatValue(formalRaiValue),
          "ISO date or epoch ms",
          "error",
          formalRaiField,
        ),
      ];
    }
    const formal = toTimestampMillis(formalRaiValue)!;
    const now = Date.now();
    if (formal > now) {
      return [
        violation(
          rule,
          `${formalRaiField} is in the future`,
          formatValue(formalRaiValue),
          "<= now",
          "error",
          formalRaiField,
        ),
      ];
    }
    if (!isEmpty(record.raiRequestedDate) && isValidTimestamp(record.raiRequestedDate)) {
      const requested = toTimestampMillis(record.raiRequestedDate)!;
      if (formal < requested) {
        return [
          violation(
            rule,
            `${formalRaiField} is before raiRequestedDate`,
            formatValue(formalRaiValue),
            ">= raiRequestedDate",
            "error",
            formalRaiField,
          ),
        ];
      }
    }
    return [];
  },
  "DQ-021": (record, rule) => {
    const isAdminChange = record.isAdminChange === true || !isEmpty(record.adminChangeType);
    if (!isAdminChange) return [];
    const issues: RuleViolation[] = [];
    if (isEmpty(record.changeMade)) {
      issues.push(
        violation(
          rule,
          "changeMade missing for admin change",
          formatValue(record.changeMade),
          "non-empty",
          "error",
          "changeMade",
        ),
      );
    }
    if (isEmpty(record.changeReason)) {
      issues.push(
        violation(
          rule,
          "changeReason missing for admin change",
          formatValue(record.changeReason),
          "non-empty",
          "error",
          "changeReason",
        ),
      );
    }
    return issues;
  },
  "DQ-022": (record, rule) => {
    if (!isNoso(record)) return [];
    const issues: RuleViolation[] = [];
    if (!isEmpty(record.submitterName)) {
      issues.push(
        violation(
          rule,
          "NOSO record should have null submitterName",
          formatValue(record.submitterName),
          "null",
          "error",
          "submitterName",
        ),
      );
    }
    if (!isEmpty(record.submitterEmail)) {
      issues.push(
        violation(
          rule,
          "NOSO record should have null submitterEmail",
          formatValue(record.submitterEmail),
          "null",
          "error",
          "submitterEmail",
        ),
      );
    }
    return issues;
  },
  "DQ-024": (record, rule) =>
    !isEmpty(record.timestamp) && !isValidTimestamp(record.timestamp)
      ? [
          violation(
            rule,
            "timestamp is not a valid ISO date or epoch milliseconds timestamp",
            formatValue(record.timestamp),
            "ISO date or epoch ms",
            "error",
          ),
        ]
      : [],
  "DQ-025": (record, rule) => {
    if (isEmpty(record.origin)) {
      return [
        violation(
          rule,
          "origin is null or empty",
          formatValue(record.origin),
          "non-empty",
          "error",
        ),
      ];
    }
    if (!VALID_ORIGINS.has(String(record.origin))) {
      return [
        violation(
          rule,
          "origin has unexpected value",
          formatValue(record.origin),
          "known origin",
          "warn",
        ),
      ];
    }
    return [];
  },
  "DQ-026": (record, rule) => {
    const hasChangeInfo = !isEmpty(record.changeMade) || !isEmpty(record.changeReason);
    if (hasChangeInfo && record.isAdminChange !== true) {
      return [
        violation(
          rule,
          "isAdminChange should be true when changeMade/changeReason present",
          formatValue(record.isAdminChange),
          "true",
          "error",
        ),
      ];
    }
    return [];
  },
  "DQ-027": (record, rule) =>
    record.isAdminChange === true && isEmpty(record.changeMade)
      ? [
          violation(
            rule,
            "changeMade missing for admin change",
            formatValue(record.changeMade),
            "non-empty",
            "error",
          ),
        ]
      : [],
  "DQ-028": (record, rule) =>
    record.isAdminChange === true && isEmpty(record.changeReason)
      ? [
          violation(
            rule,
            "changeReason missing for admin change",
            formatValue(record.changeReason),
            "non-empty",
            "error",
          ),
        ]
      : [],
};

const RULES_BY_INDEX = new Map<BaseIndex, ChecklistItem[]>();

export function evaluateRecord(baseIndex: BaseIndex, record: Record<string, any>): RuleViolation[] {
  const rules = getRulesForIndex(baseIndex);
  const violations: RuleViolation[] = [];

  for (const rule of rules) {
    const check = AUTO_RULE_CHECKS[rule.checkId];
    if (!check) continue;
    const result = check(record, rule);
    if (result.length) {
      violations.push(...result);
    }
  }

  return violations;
}

export function getRuleSummary(baseIndex: BaseIndex): RuleSummary {
  const rules = getRulesForIndex(baseIndex);
  const automatedRuleIds = rules
    .filter((rule) => AUTO_RULE_CHECKS[rule.checkId])
    .map((rule) => rule.checkId);
  const manualRuleIds = rules
    .filter((rule) => !AUTO_RULE_CHECKS[rule.checkId])
    .map((rule) => rule.checkId);

  return {
    total: rules.length,
    auto: automatedRuleIds.length,
    manual: manualRuleIds.length,
    automatedRuleIds,
    manualRuleIds,
  };
}

function getRulesForIndex(baseIndex: BaseIndex): ChecklistItem[] {
  const cached = RULES_BY_INDEX.get(baseIndex);
  if (cached) return cached;
  const rules = checklist.filter((rule) =>
    rule.indices.map((value) => value.trim()).includes(baseIndex),
  );
  RULES_BY_INDEX.set(baseIndex, rules);
  return rules;
}

function violation(
  rule: ChecklistItem,
  message: string,
  actual: string,
  expected: string,
  severity: RuleSeverity,
  fieldOverride?: string,
): RuleViolation {
  return {
    ruleId: rule.checkId,
    field: fieldOverride ?? rule.fieldName,
    severity,
    expected: expected || rule.expectedResult,
    actual,
    message,
  };
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function isOneMacOrigin(record: Record<string, any>): boolean {
  return normalize(record.origin) === "onemac";
}

function isDeletedRecord(record: Record<string, any>): boolean {
  return record.deleted === true;
}

function isAdminChangeRecord(record: Record<string, any>): boolean {
  return record.isAdminChange === true || !isEmpty(record.adminChangeType);
}

function isLikelySeatoolSnapshot(record: Record<string, any>): boolean {
  return (
    isEmpty(record.origin) &&
    !isEmpty(record.changed_date) &&
    !isEmpty(record.seatoolStatus) &&
    isEmpty(record.event)
  );
}

function isLegacyRecord(record: Record<string, any>): boolean {
  const origin = normalize(record.origin);
  return (
    origin === "onemaclegacy" ||
    origin === "seatool" ||
    !isEmpty(record.pk) ||
    !isEmpty(record.GSI1pk)
  );
}

function shouldCheckOrigin(record: Record<string, any>): boolean {
  return (
    !isDeletedRecord(record) &&
    !isAdminChangeRecord(record) &&
    !isLikelySeatoolSnapshot(record) &&
    hasOneMacFootprint(record)
  );
}

function shouldCheckLegacyKey(record: Record<string, any>): boolean {
  return (
    !isDeletedRecord(record) &&
    !isAdminChangeRecord(record) &&
    !isLikelySeatoolSnapshot(record) &&
    isLegacyRecord(record)
  );
}

function requiresSubmitterIdentity(record: Record<string, any>): boolean {
  return (
    !isDeletedRecord(record) &&
    !isAdminChangeRecord(record) &&
    !isNoso(record) &&
    isOneMacOrigin(record)
  );
}

function hasOneMacFootprint(record: Record<string, any>): boolean {
  return (
    !isEmpty(record.submissionDate) ||
    !isEmpty(record.submitterName) ||
    !isEmpty(record.submitterEmail) ||
    !isEmpty(record.packageId) ||
    !isEmpty(record.makoChangedDate)
  );
}

function isMedicaidSpa(value: unknown): boolean {
  return normalize(value) === "medicaid spa";
}

function isPending(value: unknown): boolean {
  return normalize(value) === "pending";
}

function isNoso(record: Record<string, any>): boolean {
  const event = normalize(record.event);
  if (event === "noso") return true;
  return normalize(record.origin) === "seatool" && event === "noso";
}

function isValidTimestamp(value: unknown): boolean {
  const timestamp = toTimestampMillis(value);
  if (timestamp === null) return false;
  return timestamp >= MIN_EPOCH_MS && timestamp <= MAX_EPOCH_MS;
}

function toTimestampMillis(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d{13}$/.test(trimmed)) {
      return Number(trimmed);
    }
    if (isIsoLikeTimestamp(trimmed)) {
      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return null;
}

function isIsoLikeTimestamp(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value);
}

function formatValue(value: unknown): string {
  if (value === undefined) return "";
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}
