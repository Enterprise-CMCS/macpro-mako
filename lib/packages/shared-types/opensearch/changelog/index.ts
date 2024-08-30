import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
  ExportHeaderOptions,
} from "./../_";
import { z } from "zod";

import { newMedicaidSubmission } from "./transforms";

// legacy
import { legacyAdminChange, legacyEvent } from "./transforms";

export type Document = z.infer<newMedicaidSubmission.Schema> &
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
  "new-medicaid-submission": newMedicaidSubmission,
};
