export class UnsupportedSearchQueryError extends Error {
  constructor() {
    super("Query contains unsupported clauses");
    this.name = "UnsupportedSearchQueryError";
  }
}

const DISALLOWED_SEARCH_KEYS = new Set([
  "script",
  "script_fields",
  "script_score",
  "scripted_metric",
  "runtime_mappings",
  "wrapper",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isTermsLookup = (value: unknown): boolean => {
  if (!isRecord(value)) return false;

  return Object.values(value).some((fieldValue) => {
    if (!isRecord(fieldValue)) return false;
    return "index" in fieldValue || "path" in fieldValue;
  });
};

const isDisallowedSearchKey = (key: string, value: unknown): boolean => {
  const normalized = key.toLowerCase();
  if (DISALLOWED_SEARCH_KEYS.has(normalized) || normalized.endsWith("_script")) {
    return true;
  }

  // A global aggregation ignores query filters, including the caller's state scope.
  if (normalized === "global" && isRecord(value)) {
    return true;
  }

  if (normalized === "terms" && isTermsLookup(value)) {
    return true;
  }

  return false;
};

export const findUnsupportedSearchKey = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = findUnsupportedSearchKey(entry);
      if (found) return found;
    }
    return undefined;
  }

  if (!isRecord(value)) return undefined;

  for (const [key, child] of Object.entries(value)) {
    if (isDisallowedSearchKey(key, child)) {
      return key.toLowerCase();
    }
    const found = findUnsupportedSearchKey(child);
    if (found) return found;
  }

  return undefined;
};

export const assertSafeSearchQuery = (value: unknown): void => {
  if (findUnsupportedSearchKey(value)) {
    throw new UnsupportedSearchQueryError();
  }
};
