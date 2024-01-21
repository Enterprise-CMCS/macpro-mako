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

export type Document = z.infer<ReturnType<typeof transforms.transformOnemac>> &
  z.infer<ReturnType<typeof transforms.transformOnemacLegacy>> &
  z.infer<ReturnType<typeof transforms.transformRaiWithdraw>> &
  z.infer<ReturnType<typeof transforms.transformWithdrawPackage>> &
  z.infer<ReturnType<typeof transforms.transformToggleWithdrawRaiEnabled>> &
  z.infer<ReturnType<typeof transforms.transformSeatoolData>> & {
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
