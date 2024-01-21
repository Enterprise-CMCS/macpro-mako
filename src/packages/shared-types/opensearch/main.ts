import {
  SeaToolTransform,
  OnemacTransform,
  OnemacLegacyTransform,
  RaiWithdrawTransform,
  WithdrawPackageTransform,
  ToggleWithdrawRaiEnabledTransform,
} from "..";

import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
} from "./_";
import { ItemResult as Changelog } from "./changelog";

export type Document = OnemacTransform &
  OnemacLegacyTransform &
  SeaToolTransform &
  RaiWithdrawTransform &
  WithdrawPackageTransform &
  ToggleWithdrawRaiEnabledTransform & { changelog?: Changelog[] };

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;
