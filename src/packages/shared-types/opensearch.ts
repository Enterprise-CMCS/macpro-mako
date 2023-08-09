import { SeaToolTransform } from "./seatool";
import { OneMacTransform } from "./onemac";

type OSData<TData> = {
  hits: {
    _index: string;
    _id: string;
    _score: number;
    _source: TData;
  }[];
};

export type OSSearch = OSData<OneMacTransform & SeaToolTransform>;
