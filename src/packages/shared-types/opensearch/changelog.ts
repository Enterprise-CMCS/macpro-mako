import { OsResponse, OsHit, OsFilterable, OsQueryState, OsAggQuery } from "./_";

export type ChangelogDocument = {
  actionType: string;
  additionalInformation: string;
  attachments?: {
    bucket: string;
    filename: string;
    key: string;
    title: string;
    uploadDate: number;
  }[];
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

export type ChangelogResponse = OsResponse<ChangelogDocument>;
export type ChangelogItemResult = OsHit<ChangelogDocument> & {
  found: boolean;
};
export type ChangelogField =
  | keyof ChangelogDocument
  | `${keyof ChangelogDocument}.keyword`;
export type ChangelogFilterable = OsFilterable<ChangelogField>;
export type ChangelogState = OsQueryState<ChangelogField>;
export type ChangelogAggs = OsAggQuery<ChangelogField>;
