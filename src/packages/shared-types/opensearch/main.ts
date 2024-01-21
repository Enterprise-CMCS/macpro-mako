import { SeaToolTransform, OnemacTransform, OnemacLegacyTransform } from "..";

import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
} from "./_";
import { ItemResult as Changelog } from "./changelog";
import { Action } from "shared-types";
import {
  toggleWithdrawRaiEnabledSchema,
  withdrawPackageSchema,
  raiWithdrawSchema,
} from "./../action-types";

import { z } from "zod";

export const transformToggleWithdrawRaiEnabled = (id: string) => {
  return toggleWithdrawRaiEnabledSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: data.raiWithdrawEnabled,
  }));
};
export const transformWithdrawPackage = (id: string) => {
  // This does nothing.  Just putting the mechanics in place.
  return withdrawPackageSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: false,
  }));
};
export const transformRaiWithdraw = (id: string) => {
  return raiWithdrawSchema.transform((data) => ({
    id,
    raiWithdrawEnabled: false,
  }));
};

export const transforms = {
  [Action.ENABLE_RAI_WITHDRAW]: transformToggleWithdrawRaiEnabled,
  [Action.DISABLE_RAI_WITHDRAW]: transformToggleWithdrawRaiEnabled,
  [Action.ISSUE_RAI]: null,
  [Action.RESPOND_TO_RAI]: null,
  [Action.WITHDRAW_RAI]: transformRaiWithdraw,
  [Action.WITHDRAW_PACKAGE]: transformWithdrawPackage,
};

export type Document = OnemacTransform &
  OnemacLegacyTransform &
  SeaToolTransform &
  z.infer<ReturnType<typeof transformRaiWithdraw>> &
  z.infer<ReturnType<typeof transformWithdrawPackage>> &
  z.infer<ReturnType<typeof transformToggleWithdrawRaiEnabled>> & {
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
