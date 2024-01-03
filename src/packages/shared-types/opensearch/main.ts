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

import { OsResponse, OsHit, OsFilterable, OsQueryState, OsAggQuery } from "./_";

export type MainDocument = OnemacTransform &
  OnemacLegacyTransform &
  SeaToolTransform &
  RaiIssueTransform &
  RaiResponseTransform &
  RaiWithdrawTransform &
  WithdrawPackageTransform &
  ToggleWithdrawRaiEnabledTransform;

export type MainResponse = OsResponse<MainDocument>;
export type MainItemResult = OsHit<MainDocument> & {
  found: boolean;
};

export type MainField = keyof MainDocument | `${keyof MainDocument}.keyword`;
export type MainFilterable = OsFilterable<MainField>;
export type MainState = OsQueryState<MainField>;
export type MainAggs = OsAggQuery<MainField>;
