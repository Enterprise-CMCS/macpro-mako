import {
  SeaToolTransform,
  OnemacTransform,
  OnemacLegacyTransform,
  RaiIssueTransform,
  RaiResponseTransform,
  RaiWithdrawTransform,
  WithdrawPackageTransform,
  ToggleWithdrawRaiEnabledTransform,
} from "..";

import { OsResponse, OsHit } from "./base";

export type IndexDocumentMain = OnemacTransform &
  OnemacLegacyTransform &
  SeaToolTransform &
  RaiIssueTransform &
  RaiResponseTransform &
  RaiWithdrawTransform &
  WithdrawPackageTransform &
  ToggleWithdrawRaiEnabledTransform;
export type OsMainSearchResponse = OsResponse<IndexDocumentMain>;
export type ItemResult = OsHit<IndexDocumentMain> & {
  found: boolean;
};
export type OsField =
  | keyof IndexDocumentMain
  | `${keyof IndexDocumentMain}.keyword`;
