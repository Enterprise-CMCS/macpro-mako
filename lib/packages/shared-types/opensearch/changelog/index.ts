import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
  ExportHeaderOptions,
} from "./../_";
import { z } from "zod";
import {
  newSubmission,
  RaiIssue,
  RaiResponse,
  RaiWithdraw,
  WithdrawPackage,
  ToggleWithdrawRaiEnabled,
  UpdateId,
} from "../../events";
import { legacyAdminChange, legacyEvent } from "./transforms";

export type Document = newSubmission.NewSubmission &
  WithdrawPackage &
  RaiResponse &
  RaiIssue &
  RaiWithdraw &
  ToggleWithdrawRaiEnabled &
  UpdateId & {
    actionType: string;
    timestamp: string;
    packageId: string;
    appkChildId: string;
    appkParentId: string;
    oldPackageId: string;
    newPackageId: string;
  } & z.infer<legacyEvent.Schema> &
  z.infer<legacyAdminChange.Schema> & {
    appkParentId: string;
    appkParent: boolean;
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

export * from "./transforms";
