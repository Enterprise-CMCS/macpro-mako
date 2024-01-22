import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
} from "./../_";
import { z } from "zod";
import { ItemResult as Changelog } from "./../changelog";
import * as transforms from "./transforms";
export * as transforms from "./transforms";

export type Document = z.infer<ReturnType<typeof transforms.newSubmission>> &
  z.infer<ReturnType<typeof transforms.legacySubmission>> &
  z.infer<ReturnType<typeof transforms.raiWithdraw>> &
  z.infer<ReturnType<typeof transforms.withdrawPackage>> &
  z.infer<ReturnType<typeof transforms.toggleWithdrawRaiEnabled>> &
  z.infer<ReturnType<typeof transforms.seatool>> & {
    changelog?: Changelog[];
  };

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;
