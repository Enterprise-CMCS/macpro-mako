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
  capitatedAmendment,
  capitatedInitial,
  capitatedRenewal,
  contractingAmendment,
  contractingInitial,
  contractingRenewal,
  newChipSubmission,
  newMedicaidSubmission,
  temporaryExtension,
  withdrawPackage,
} from "./transforms";

// legacy
import { legacyAdminChange, legacyEvent } from "./transforms";

export type Document = z.infer<capitatedAmendment.Schema> &
  z.infer<capitatedInitial.Schema> &
  z.infer<capitatedRenewal.Schema> &
  z.infer<contractingAmendment.Schema> &
  z.infer<contractingInitial.Schema> &
  z.infer<contractingRenewal.Schema> &
  z.infer<newChipSubmission.Schema> &
  z.infer<newMedicaidSubmission.Schema> &
  z.infer<temporaryExtension.Schema> &
  z.infer<legacyEvent.Schema> &
  z.infer<legacyAdminChange.Schema>;

// & {
//   appkParentId: string;
//   appkParent: boolean;
// };

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
  "capitated-amendment": capitatedAmendment,
  "capitated-initial": capitatedInitial,
  "capitated-renewal": capitatedRenewal,
  "contracting-amendment": contractingAmendment,
  "contracting-initial": contractingInitial,
  "contracting-renewal": contractingRenewal,
  "new-chip-submission": newChipSubmission,
  "new-medicaid-submission": newMedicaidSubmission,
  "temporary-extension": temporaryExtension,
  "withdraw-package": withdrawPackage,
};
