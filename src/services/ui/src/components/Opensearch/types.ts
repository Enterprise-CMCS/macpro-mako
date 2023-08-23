import { OsMainSourceItem } from "shared-types";

type FilterType =
  | "term"
  | "terms"
  | "match"
  | "range"
  | "search"
  | "global_search"
  | "exists";

type RangeValue = { gte?: string; lte?: string };
type FilterValue = string | string[] | number | boolean | RangeValue;

export type Filterable = {
  type: FilterType;
  field: keyof OsMainSourceItem | `${keyof OsMainSourceItem}.keyword`;
  value: FilterValue;
  prefix: "must" | "must_not" | "should" | "filter";
};

export type QueryState<T = any> = {
  sort: { field: string; order: "asc" | "desc" };
  pagination: { number: number; size: number };
  buckets: Record<string, { label: string; value: string }[]>;
  data: T[];
};

export type AggregateQuery = Record<
  string,
  { terms: { field: string; size: number } }
>;

export type Aggregations = Record<
  string,
  {
    doc_count_error_upper_bound: number;
    sum_other_doc_count: 0;
    buckets: { key: string; doc_count: number }[];
  }
>;
