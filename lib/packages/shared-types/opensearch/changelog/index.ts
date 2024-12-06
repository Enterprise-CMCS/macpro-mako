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
  legacyAdminChange,
  legacyEvent,
  newChipSubmission,
  newMedicaidSubmission,
  respondToRai,
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
export type ContractingAmendmentDocument = z.infer<contractingAmendment.Schema>;
export type ContractingInitialDocument = z.infer<contractingInitial.Schema>;
export type ContractingRenewalDocument = z.infer<contractingRenewal.Schema>;
export type LegacyEventDocument = z.infer<legacyEvent.Schema>;
export type LegacyAdminChangeDocument = z.infer<legacyAdminChange.Schema>;
export type NewChipSubmissionDocument = z.infer<newChipSubmission.Schema>;
export type NewMedicaidSubmissionDocument = z.infer<newMedicaidSubmission.Schema>;
export type RespondToRaiDocument = z.infer<respondToRai.Schema>;
export type TemporaryExtensionDocument = z.infer<temporaryExtension.Schema>;
export type ToggleWithdrawRaiDocument = z.infer<toggleWithdrawRai.Schema>;
export type UploadSubsequentDocuments = z.infer<uploadSubsequentDocuments.Schema>;
export type WithdrawPackageDocument = z.infer<withdrawPackage.Schema>;
export type WithdrawRaiDocument = z.infer<withdrawRai.Schema>;

export type Document = Omit<AppkDocument, "event"> &
  Omit<CapitatedAmendmentDocument, "event"> &
  Omit<CapitatedInitialDocument, "event"> &
  Omit<CapitatedRenewalDocument, "event"> &
  Omit<ContractingAmendmentDocument, "event"> &
  Omit<ContractingInitialDocument, "event"> &
  Omit<ContractingRenewalDocument, "event"> &
  LegacyEventDocument &
  LegacyAdminChangeDocument &
  Omit<NewChipSubmissionDocument, "event"> &
  Omit<NewMedicaidSubmissionDocument, "event"> &
  Omit<RespondToRaiDocument, "event"> &
  Omit<TemporaryExtensionDocument, "event"> &
  Omit<ToggleWithdrawRaiDocument, "event"> &
  Omit<UploadSubsequentDocuments, "event"> &
  Omit<WithdrawPackageDocument, "event"> &
  Omit<WithdrawRaiDocument, "event"> & {
    event:
      | "app-k"
      | "capitated-amendment"
      | "capitated-initial"
      | "capitated-renewal"
      | "contracting-amendment"
      | "contracting-initial"
      | "contracting-renewal"
      | "new-chip-submission"
      | "new-medicaid-submission"
      | "respond-to-rai"
      | "temporary-extension"
      | "toggle-withdraw-rai"
      | "upload-subsequent-documents"
      | "withdraw-package"
      | "withdraw-rai";
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
