import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
} from "./../_";
import { z } from "zod";
import { ItemResult as Changelog } from "./../changelog";
import { transforms } from "../..";

export type Document = z.infer<transforms.newSubmission.Schema> &
  z.infer<transforms.legacySubmission.Schema> &
  z.infer<transforms.withdrawRai.Schema> &
  z.infer<transforms.withdrawPackage.Schema> &
  z.infer<transforms.toggleWithdrawEnabled.Schema> &
  z.infer<transforms.seatool.Schema> & {
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
