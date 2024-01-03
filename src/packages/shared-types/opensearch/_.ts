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

export type OsFilterable<_FIELD> = {
  type: OsFilterType;
  label?: string;
  component?: string;
  field: _FIELD;
  value: OsFilterValue;
  prefix: "must" | "must_not" | "should" | "filter";
};

export type OsQueryState<_FIELD> = {
  sort: { field: _FIELD; order: "asc" | "desc" };
  pagination: { number: number; size: number };
  filters: OsFilterable<_FIELD>[];
  search?: string;
};

export type OsAggQuery<_FIELD> = {
  name: string;
  type: OsFilterType;
  field: _FIELD;
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
