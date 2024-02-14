import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
  ExportHeaderOptions,
} from "./../_";
import { z } from "zod";
import { type } from "./transforms";

export type SeaSubTypeDocument = z.infer<type.SeaSubTypeSchema>;

export type Response = Res<SeaSubTypeDocument>;
export type ItemResult = Hit<SeaSubTypeDocument> & {
  found: boolean;
};

export type Field =
  | keyof SeaSubTypeDocument
  | `${keyof SeaSubTypeDocument}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;
export type ExportHeader = ExportHeaderOptions<SeaSubTypeDocument>;

export * from "./transforms";
