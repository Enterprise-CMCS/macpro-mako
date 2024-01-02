import {
  SeaToolTransform,
  OnemacTransform,
  OnemacLegacyTransform,
  RaiIssueTransform,
  RaiResponseTransform,
  RaiWithdrawTransform,
  WithdrawPackageTransform,
  ToggleWithdrawRaiEnabledTransform,
} from "..";

export type OsHit<T> = {
  _index: string;
  _id: string;
  _score: number;
  _source: T;
  sort: Array<number>;
};
export type OsHits<T> = {
  hits: OsHit<T>[];
  max_score: number;
  total: { value: number; relation: "eq" };
};

export type OsResponse<T> = {
  _shards: {
    total: number;
    failed: number;
    successful: number;
    skipped: number;
  };
  hits: OsHits<T>;
  total: {
    value: number;
  };
  max_score: number | null;
  took: number;
  timed_out: boolean;
  aggregations?: OsAggResult;
};

export type OsFilterType =
  | "term"
  | "terms"
  | "match"
  | "range"
  | "search"
  | "global_search"
  | "exists";

export type OsRangeValue = { gte?: string; lte?: string };
export type OsFilterValue = string | string[] | number | boolean | OsRangeValue;
export type OsMainSourceItem = OnemacTransform &
  OnemacLegacyTransform &
  SeaToolTransform &
  RaiIssueTransform &
  RaiResponseTransform &
  RaiWithdrawTransform &
  WithdrawPackageTransform &
  ToggleWithdrawRaiEnabledTransform;
export type OsMainSearchResponse = OsResponse<OsMainSourceItem>;
export type ItemResult = OsHit<OsMainSourceItem> & {
  found: boolean;
};
export type OsField =
  | keyof OsMainSourceItem
  | `${keyof OsMainSourceItem}.keyword`;

export type OsFilterable = {
  type: OsFilterType;
  label?: string;
  component?: string;
  field: OsField;
  value: OsFilterValue;
  prefix: "must" | "must_not" | "should" | "filter";
};

export type OsQueryState = {
  sort: { field: OsField; order: "asc" | "desc" };
  pagination: { number: number; size: number };
  filters: OsFilterable[];
  search?: string;
};

export type OsAggQuery = {
  name: string;
  type: OsFilterType;
  field: OsField;
  size: number;
};

export type OsAggBucket = { key: string; doc_count: number };

export type OsAggResult = Record<
  string,
  {
    doc_count_error_upper_bound: number;
    sum_other_doc_count: number;
    buckets: OsAggBucket[];
  }
>;

export type OsExportHeaderOptions<TData> = {
  transform: (data: TData) => string;
  name: string;
};

export type OsIndex = "main" | "seatool" | "changelog";
