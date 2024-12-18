import { z } from "zod";
import { ItemResult as Changelog } from "../changelog";
import { AggQuery, Filterable as FIL, Hit, QueryState, Response as Res } from "./../_";
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

export type AppkDocument = z.infer<appK.Schema>;
export type CapitatedAmendmentDocument = z.infer<capitatedAmendment.Schema>;
export type CapitatedInitialDocument = z.infer<capitatedInitial.Schema>;
export type CapitatedRenewalDocument = z.infer<capitatedRenewal.Schema>;
export type ChangedDateDocument = z.infer<changedDate.Schema>;
export type ContractingAmendmentDocument = z.infer<contractingAmendment.Schema>;
export type ContractingInitialDocument = z.infer<contractingInitial.Schema>;
export type ContractingRenewalDocument = z.infer<contractingAmendment.Schema>;
export type LegacyPackageViewDocument = z.infer<legacyPackageView.Schema>;
export type NewChipSubmissionDocument = z.infer<newChipSubmission.Schema>;
export type NewMedicaidSubmissionDocument = z.infer<newMedicaidSubmission.Schema>;
export type RespondToRaiDocument = z.infer<respondToRai.Schema>;
export type SeatoolDocument = z.infer<seatool.Schema>;
export type TemporaryExtensionDocument = z.infer<temporaryExtension.Schema>;
export type ToggleWithdrawRaiDocument = z.infer<toggleWithdrawRai.Schema>;
export type UploadSubsequentDocuments = z.infer<uploadSubsequentDocuments.Schema>;
export type WithdrawPackageDocument = z.infer<withdrawPackage.Schema>;
export type WithdrawRaiDocument = z.infer<withdrawRai.Schema>;

export type Document = AppkDocument &
  CapitatedAmendmentDocument &
  CapitatedInitialDocument &
  CapitatedRenewalDocument &
  ChangedDateDocument &
  ContractingAmendmentDocument &
  ContractingInitialDocument &
  ContractingRenewalDocument &
  LegacyPackageViewDocument &
  NewChipSubmissionDocument &
  NewMedicaidSubmissionDocument &
  RespondToRaiDocument &
  SeatoolDocument &
  TemporaryExtensionDocument &
  ToggleWithdrawRaiDocument &
  UploadSubsequentDocuments &
  WithdrawPackageDocument &
  WithdrawRaiDocument & {
    makoChangedDate: string;
    changelog?: Changelog[];
    appkChildren?: Omit<ItemResult, "found">[];
    deleted?: boolean;
    adminChangeType?: string;
    changeMade?: string;
    idToBeUpdated?: string;
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
