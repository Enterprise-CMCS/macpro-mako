import {
  Response as Res,
  Hit,
  Filterable as FIL,
  QueryState,
  AggQuery,
} from "./_";

export type Document = {
  actionType: string;
  additionalInformation: string;
  attachments?: {
    bucket: string;
    filename: string;
    key: string;
    title: string;
    uploadDate: number;
  }[];
  timestamp: string;
  authority: string;
  id: string;
  origin: string;
  packageId: string;
  proposedEffectiveDate: number;
  raiWithdrawEnabled: boolean;
  rais: any;
  requestedDate: number;
  responseDate: number;
  state: string;
  submitterEmail: string;
  submitterName: string;
  withdrawnDate: number;
};

export type Response = Res<Document>;
export type ItemResult = Hit<Document> & {
  found: boolean;
};

export type Field = keyof Document | `${keyof Document}.keyword`;
export type Filterable = FIL<Field>;
export type State = QueryState<Field>;
export type Aggs = AggQuery<Field>;
