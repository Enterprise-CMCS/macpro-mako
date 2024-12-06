import { z } from "zod";
import {
  AggQuery,
  ExportHeaderOptions,
  Filterable as FIL,
  Hit,
  QueryState,
  Response as Res,
} from "./../_";

import {
  appK,
  capitatedAmendment,
  capitatedInitial,
  capitatedRenewal,
  contractingAmendment,
  contractingInitial,
  contractingRenewal,
  newChipSubmission,
  newMedicaidSubmission,
  respondToRai,
  temporaryExtension,
  toggleWithdrawRai,
  uploadSubsequentDocuments,
  withdrawPackage,
  withdrawRai,
} from "./transforms";

// legacy
// import { legacyAdminChange, legacyEvent } from "./transforms";
// | z.infer<legacyEvent.Schema>
// | z.infer<legacyAdminChange.Schema>

export type Document =
  | z.infer<capitatedAmendment.Schema>
  | z.infer<capitatedInitial.Schema>
  | z.infer<capitatedRenewal.Schema>
  | z.infer<contractingAmendment.Schema>
  | z.infer<contractingInitial.Schema>
  | z.infer<contractingRenewal.Schema>
  | z.infer<newChipSubmission.Schema>
  | z.infer<newMedicaidSubmission.Schema>
  | z.infer<respondToRai.Schema>
  | z.infer<temporaryExtension.Schema>
  | z.infer<toggleWithdrawRai.Schema>
  | z.infer<uploadSubsequentDocuments.Schema>
  | z.infer<withdrawPackage.Schema>
  | z.infer<withdrawRai.Schema>;

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
