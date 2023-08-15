import { SeaToolTransform } from "./seatool";
import { OneMacTransform } from "./onemac";

export type OsHit<T> = {
  _index: string;
  _id: string;
  _score: number;
  _source: T;
  sort: Array<number>;
};
export type OsHits<T> = {
  hits: OsHit<T>[];
};

export type OsResponse<T> = {
  _shards: {
    total: number;
    failed: number;
    successful: number;
    skipped: number;
  };
  hits: OsHits<T>;
  total: {
    value: number;
  };
  max_score: number | null;
  took: number;
  timed_out: boolean;
};

export type OsMainSourceItem = OneMacTransform & SeaToolTransform;
export type OsMainSearchResponse = OsResponse<OsMainSourceItem>;
export type SearchData = OsHits<OsMainSourceItem>;
