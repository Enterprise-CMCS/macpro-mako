import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
  ExportHeaderOptions,
} from "./../_";
import {
  OneMac,
  RaiIssue,
  RaiResponse,
  RaiWithdraw,
  WithdrawPackage,
  ToggleWithdrawRaiEnabled,
} from "../../action-types";

export type Document = OneMac &
  WithdrawPackage &
  RaiResponse &
  RaiIssue &
  RaiWithdraw &
  ToggleWithdrawRaiEnabled & {
    actionType: string;
    timestamp: string;
    packageId: string;
  };

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;
export type ExportHeader = ExportHeaderOptions<Document>;
