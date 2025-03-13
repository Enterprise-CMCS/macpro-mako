import { z } from "zod";

import { AggQuery, Filterable as FIL, Hit, QueryState, Response as Res } from "../_";

import { SPA_Type } from "./transforms";

export type Document = z.infer<SPA_Type.Schema>;

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;

export * from "./transforms";
