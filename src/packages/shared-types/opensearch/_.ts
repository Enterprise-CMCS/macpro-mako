export type Hit<T> = {
  _index: string;
  _id: string;
  _score: number;
  _source: T;
  sort: Array<number>;
};
export type Hits<T> = {
  hits: Hit<T>[];
  max_score: number;
  total: { value: number; relation: "eq" };
};

export type Response<T> = {
  _shards: {
    total: number;
    failed: number;
    successful: number;
    skipped: number;
  };
  hits: Hits<T>;
  total: {
    value: number;
  };
  max_score: number | null;
  took: number;
  timed_out: boolean;
  aggregations?: AggResult;
};

export type FilterType =
  | "term"
  | "terms"
  | "match"
  | "range"
  | "search"
  | "global_search"
  | "exists";

export type RangeValue = { gte?: string; lte?: string };
export type FilterValue =
  | string
  | string[]
  | number
  | boolean
  | RangeValue
  | null;

export type Filterable<_FIELD> = {
  type: FilterType;
  label?: string;
  component?: string;
  field: _FIELD;
  value: FilterValue;
  prefix: "must" | "must_not" | "should" | "filter";
};

export type QueryState<_FIELD> = {
  sort: { field: _FIELD; order: "asc" | "desc" };
  pagination: { number: number; size: number };
  filters: Filterable<_FIELD>[];
  search?: string;
};

export type AggQuery<_FIELD> = {
  name: string;
  type: FilterType;
  field: _FIELD;
  size: number;
};

export type AggBucket = { key: string; doc_count: number };

export type AggResult = Record<
  string,
  {
    doc_count_error_upper_bound: number;
    sum_other_doc_count: number;
    buckets: AggBucket[];
  }
>;

export type ExportHeaderOptions<TData> = {
  transform: (data: TData) => string;
  name: string;
};

export type Index = "main" | "insights" | "changelog" | "types" | "subtypes";
