import { SeaToolTransform } from "./seatool";
import { OneMacTransform } from "./onemac";

type OpenSearchSource<TSource> = {
  hits: {
    _index: string;
    _id: string;
    _score: number;
    _source: TSource;
  }[];
};

export type OSSearch = OpenSearchSource<OneMacTransform & SeaToolTransform>;
