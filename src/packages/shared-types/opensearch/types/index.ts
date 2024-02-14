import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
  ExportHeaderOptions,
} from "./../_";
import { z } from "zod";
import { spa_type } from "./transforms";

export type SeaTypeDocument = z.infer<spa_type.SeaTypeSchema>;

export type Response = Res<SeaTypeDocument>;
export type ItemResult = Hit<SeaTypeDocument> & {
  found: boolean;
};

export type Field = keyof SeaTypeDocument | `${keyof SeaTypeDocument}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;
export type ExportHeader = ExportHeaderOptions<SeaTypeDocument>;

export * from "./transforms";
