import { z } from "zod";
import { AggQuery, Filterable as FIL, Hit, QueryState, Response as Res } from "./../_";
import { ItemResult as Changelog } from "./../changelog";
import {
  appK,
  capitatedAmendment,
  capitatedInitial,
  capitatedRenewal,
  changedDate,
  contractingAmendment,
  contractingInitial,
  contractingRenewal,
  legacyPackageView,
  newChipSubmission,
  newMedicaidSubmission,
  respondToRai,
  seatool,
  temporaryExtension,
  toggleWithdrawRai,
  uploadSubsequentDocuments,
  withdrawPackage,
  withdrawRai,
} from "./transforms";

export type Document = (
  | z.infer<appK.Schema>
  | z.infer<capitatedAmendment.Schema>
  | z.infer<capitatedInitial.Schema>
  | z.infer<capitatedRenewal.Schema>
  | z.infer<changedDate.Schema>
  | z.infer<contractingAmendment.Schema>
  | z.infer<contractingInitial.Schema>
  | z.infer<contractingRenewal.Schema>
  | z.infer<legacyPackageView.Schema>
  | z.infer<newChipSubmission.Schema>
  | z.infer<newMedicaidSubmission.Schema>
  | z.infer<respondToRai.Schema>
  | z.infer<seatool.Schema>
  | z.infer<temporaryExtension.Schema>
  | z.infer<toggleWithdrawRai.Schema>
  | z.infer<uploadSubsequentDocuments.Schema>
  | z.infer<withdrawPackage.Schema>
  | z.infer<withdrawRai.Schema>
) & {
  makoChangedDate: string;
  changelog?: Changelog[];
  appkChildren?: Omit<ItemResult, "found">[];
};

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;

export * from "./transforms";

export const transforms = {
  "app-k": appK,
  "capitated-amendment": capitatedAmendment,
  "capitated-initial": capitatedInitial,
  "capitated-renewal": capitatedRenewal,
  "contracting-amendment": contractingAmendment,
  "contracting-initial": contractingInitial,
  "contracting-renewal": contractingRenewal,
  "new-chip-submission": newChipSubmission,
  "new-medicaid-submission": newMedicaidSubmission,
  "respond-to-rai": respondToRai,
  "temporary-extension": temporaryExtension,
  "toggle-withdraw-rai": toggleWithdrawRai,
  "upload-subsequent-documents": uploadSubsequentDocuments,
  "withdraw-package": withdrawPackage,
  "withdraw-rai": withdrawRai,
};
