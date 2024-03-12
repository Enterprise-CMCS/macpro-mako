import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
  ExportHeaderOptions,
} from "./../_";
import { z } from "zod";
import { ItemResult as Changelog } from "./../changelog";
import {
  newSubmission,
  legacySubmission,
  withdrawPackage,
  withdrawRai,
  toggleWithdrawEnabled,
  seatool,
  changedDate,
  newSubmissionTempExtension,
} from "./transforms";

export type Document = z.infer<newSubmission.Schema> &
  z.infer<legacySubmission.Schema> &
  z.infer<withdrawRai.Schema> &
  z.infer<withdrawPackage.Schema> &
  z.infer<toggleWithdrawEnabled.Schema> &
  z.infer<seatool.Schema> &
  z.infer<changedDate.Schema> & {
    changelog?: Changelog[];
    appkChildren?: ItemResult[];
  } & 
  z.infer<newSubmissionTempExtension.Schema>;

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;
export type ExportHeader = ExportHeaderOptions<Document>;

export * from "./transforms";
